/**
 * Salesforce Lead Synchronization
 * 
 * Bidirectional sync between local PostgreSQL leads and Salesforce leads
 */

import 'server-only';
import { db, leads, type SelectLead } from './db';
import { querySalesforce, createRecord, updateRecord } from './salesforce';
import { SalesforceLead } from './salesforce-types';
import { eq, isNull } from 'drizzle-orm';

/**
 * Map local lead status to Salesforce lead status
 */
function mapStatusToSalesforce(status: 'hot' | 'warm' | 'cold'): string {
  const mapping = {
    hot: 'Hot',
    warm: 'Warm',
    cold: 'Cold'
  };
  return mapping[status] || 'Open - Not Contacted';
}

/**
 * Map Salesforce status to local status
 */
function mapStatusFromSalesforce(sfStatus?: string): 'hot' | 'warm' | 'cold' {
  if (!sfStatus) return 'cold';
  
  const lowerStatus = sfStatus.toLowerCase();
  if (lowerStatus.includes('hot')) return 'hot';
  if (lowerStatus.includes('warm')) return 'warm';
  return 'cold';
}

/**
 * Map local lead qualification to Salesforce status
 */
function mapQualificationToSalesforce(qualification: string): string {
  const mapping: Record<string, string> = {
    nouveau: 'Open - Not Contacted',
    qualifie: 'Working - Contacted',
    transforme: 'Qualified'
  };
  return mapping[qualification] || 'Open - Not Contacted';
}

/**
 * Map Salesforce status to local qualification
 */
function mapQualificationFromSalesforce(sfStatus?: string): 'nouveau' | 'qualifie' | 'transforme' {
  if (!sfStatus) return 'nouveau';
  
  const lowerStatus = sfStatus.toLowerCase();
  if (lowerStatus.includes('qualified')) return 'transforme';
  if (lowerStatus.includes('working') || lowerStatus.includes('contacted')) return 'qualifie';
  return 'nouveau';
}

/**
 * Convert local lead to Salesforce lead format
 */
export function convertLocalLeadToSalesforce(lead: SelectLead): Partial<SalesforceLead> {
  // Split contact name into first and last name
  const nameParts = lead.contactName.trim().split(' ');
  const firstName = nameParts.slice(0, -1).join(' ') || undefined;
  const lastName = nameParts[nameParts.length - 1];

  return {
    FirstName: firstName,
    LastName: lastName,
    Company: lead.companyName,
    Email: lead.email,
    Phone: lead.phone || undefined,
    Description: lead.notes || undefined,
    Rating: mapStatusToSalesforce(lead.status),
    Status: mapQualificationToSalesforce(lead.qualificationStatus),
    // Store estimated value in AnnualRevenue field (you can customize this)
    AnnualRevenue: lead.estimatedValue ? Number(lead.estimatedValue) : undefined
  };
}

/**
 * Convert Salesforce lead to local lead format
 */
export function convertSalesforceLeadToLocal(sfLead: SalesforceLead): Omit<SelectLead, 'id' | 'createdAt' | 'updatedAt' | 'convertedToAccountId' | 'convertedToOpportunityId'> {
  const fullName = [sfLead.FirstName, sfLead.LastName].filter(Boolean).join(' ');
  
  return {
    companyName: sfLead.Company,
    contactName: fullName,
    email: sfLead.Email || '',
    phone: sfLead.Phone || null,
    estimatedValue: sfLead.AnnualRevenue?.toString() || '0',
    status: mapStatusFromSalesforce(sfLead.Rating),
    qualificationStatus: mapQualificationFromSalesforce(sfLead.Status),
    notes: sfLead.Description || null,
    salesforceId: sfLead.Id || null,
    lastSyncedAt: new Date()
  };
}

/**
 * Push a local lead to Salesforce
 * Creates if doesn't exist, updates if exists
 */
export async function pushLeadToSalesforce(lead: SelectLead): Promise<string> {
  const sfLeadData = convertLocalLeadToSalesforce(lead);

  if (lead.salesforceId) {
    // Update existing Salesforce lead
    await updateRecord('Lead', lead.salesforceId, sfLeadData);
    
    // Update last synced time
    await db
      .update(leads)
      .set({ lastSyncedAt: new Date() })
      .where(eq(leads.id, lead.id));
    
    return lead.salesforceId;
  } else {
    // Create new Salesforce lead
    const result = await createRecord('Lead', sfLeadData);
    
    // Update local lead with Salesforce ID
    await db
      .update(leads)
      .set({ 
        salesforceId: result.id,
        lastSyncedAt: new Date()
      })
      .where(eq(leads.id, lead.id));
    
    return result.id;
  }
}

/**
 * Pull leads from Salesforce and create/update in local DB
 */
export async function pullLeadsFromSalesforce(): Promise<{
  created: number;
  updated: number;
  total: number;
}> {
  // Query recent leads from Salesforce (last 90 days)
  const soql = `
    SELECT 
      Id, FirstName, LastName, Company, Email, Phone,
      Description, Rating, Status, AnnualRevenue,
      CreatedDate, LastModifiedDate
    FROM Lead
    WHERE CreatedDate >= LAST_N_DAYS:90
    ORDER BY CreatedDate DESC
    LIMIT 500
  `;

  const sfLeadsResult = await querySalesforce<SalesforceLead>(soql);
  const sfLeads = sfLeadsResult.records;

  let created = 0;
  let updated = 0;

  for (const sfLead of sfLeads) {
    if (!sfLead.Id || !sfLead.Email) continue;

    // Check if lead already exists locally
    const existingLeads = await db
      .select()
      .from(leads)
      .where(eq(leads.salesforceId, sfLead.Id));

    const localLeadData = convertSalesforceLeadToLocal(sfLead);

    if (existingLeads.length > 0) {
      // Update existing local lead
      await db
        .update(leads)
        .set({
          ...localLeadData,
          updatedAt: new Date()
        })
        .where(eq(leads.id, existingLeads[0].id));
      
      updated++;
    } else {
      // Create new local lead
      await db.insert(leads).values({
        ...localLeadData,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      created++;
    }
  }

  return {
    created,
    updated,
    total: sfLeads.length
  };
}

/**
 * Sync all local leads to Salesforce
 */
export async function pushAllLeadsToSalesforce(): Promise<{
  synced: number;
  errors: Array<{ leadId: number; error: string }>;
}> {
  const allLeads = await db.select().from(leads);
  
  let synced = 0;
  const errors: Array<{ leadId: number; error: string }> = [];

  for (const lead of allLeads) {
    try {
      await pushLeadToSalesforce(lead);
      synced++;
    } catch (error) {
      errors.push({
        leadId: lead.id,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  return { synced, errors };
}

/**
 * Full bidirectional sync
 * 1. Pull from Salesforce (updates local DB)
 * 2. Push local changes to Salesforce
 */
export async function syncLeadsBidirectional(): Promise<{
  pulled: { created: number; updated: number; total: number };
  pushed: { synced: number; errors: Array<{ leadId: number; error: string }> };
}> {
  // First, pull from Salesforce
  const pulled = await pullLeadsFromSalesforce();
  
  // Then, push local leads that haven't been synced recently (or never synced)
  const localLeadsToSync = await db
    .select()
    .from(leads)
    .where(isNull(leads.lastSyncedAt));
  
  let synced = 0;
  const errors: Array<{ leadId: number; error: string }> = [];

  for (const lead of localLeadsToSync) {
    try {
      await pushLeadToSalesforce(lead);
      synced++;
    } catch (error) {
      errors.push({
        leadId: lead.id,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  return {
    pulled,
    pushed: { synced, errors }
  };
}

