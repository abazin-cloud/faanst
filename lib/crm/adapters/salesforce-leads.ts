import 'server-only';

import { createRecord, querySalesforce } from '@/lib/salesforce';
import { CrmLead, CrmLeadAdapter, CrmLeadFilters, CrmLeadInput, CrmLeadQueryResult } from '../types';

const SALESFORCE_LEAD_FIELD_MAP = {
  id: 'Id',
  firstName: 'FirstName',
  lastName: 'LastName',
  company: 'Company',
  title: 'Title',
  email: 'Email',
  phone: 'Phone',
  mobilePhone: 'MobilePhone',
  street: 'Street',
  city: 'City',
  state: 'State',
  postalCode: 'PostalCode',
  country: 'Country',
  leadSource: 'LeadSource',
  status: 'Status',
  rating: 'Rating',
  industry: 'Industry',
  website: 'Website',
  description: 'Description',
  ownerId: 'OwnerId',
  createdAt: 'CreatedDate',
  updatedAt: 'LastModifiedDate',
} as const;

const LEAD_SELECT_FIELDS = Object.values(SALESFORCE_LEAD_FIELD_MAP);
const SF_LOGIN_URL = (process.env.SF_LOGIN_URL || 'https://login.salesforce.com').replace(/\/$/, '');

function escapeSoql(value: string): string {
  return value.replace(/'/g, "\\'");
}

function mapSalesforceRecordToLead(record: Record<string, any>): CrmLead {
  return {
    id: record[SALESFORCE_LEAD_FIELD_MAP.id],
    firstName: record[SALESFORCE_LEAD_FIELD_MAP.firstName] || undefined,
    lastName: record[SALESFORCE_LEAD_FIELD_MAP.lastName] || '',
    company: record[SALESFORCE_LEAD_FIELD_MAP.company] || '',
    title: record[SALESFORCE_LEAD_FIELD_MAP.title] || undefined,
    email: record[SALESFORCE_LEAD_FIELD_MAP.email] || undefined,
    phone: record[SALESFORCE_LEAD_FIELD_MAP.phone] || undefined,
    mobilePhone: record[SALESFORCE_LEAD_FIELD_MAP.mobilePhone] || undefined,
    street: record[SALESFORCE_LEAD_FIELD_MAP.street] || undefined,
    city: record[SALESFORCE_LEAD_FIELD_MAP.city] || undefined,
    state: record[SALESFORCE_LEAD_FIELD_MAP.state] || undefined,
    postalCode: record[SALESFORCE_LEAD_FIELD_MAP.postalCode] || undefined,
    country: record[SALESFORCE_LEAD_FIELD_MAP.country] || undefined,
    leadSource: record[SALESFORCE_LEAD_FIELD_MAP.leadSource] || undefined,
    status: record[SALESFORCE_LEAD_FIELD_MAP.status] || undefined,
    rating: record[SALESFORCE_LEAD_FIELD_MAP.rating] || undefined,
    industry: record[SALESFORCE_LEAD_FIELD_MAP.industry] || undefined,
    website: record[SALESFORCE_LEAD_FIELD_MAP.website] || undefined,
    description: record[SALESFORCE_LEAD_FIELD_MAP.description] || undefined,
    ownerId: record[SALESFORCE_LEAD_FIELD_MAP.ownerId] || undefined,
    createdAt: record[SALESFORCE_LEAD_FIELD_MAP.createdAt] || undefined,
    updatedAt: record[SALESFORCE_LEAD_FIELD_MAP.updatedAt] || undefined,
    externalUrl: record[SALESFORCE_LEAD_FIELD_MAP.id]
      ? `${SF_LOGIN_URL}/${record[SALESFORCE_LEAD_FIELD_MAP.id]}`
      : undefined,
    raw: record,
  };
}

function buildCreatePayload(input: CrmLeadInput): Record<string, any> {
  const payload: Record<string, any> = {};

  const mapEntry = (
    key: keyof typeof SALESFORCE_LEAD_FIELD_MAP,
    value: string | undefined,
  ) => {
    if (value) {
      payload[SALESFORCE_LEAD_FIELD_MAP[key]] = value;
    }
  };

  mapEntry('firstName', input.firstName);
  mapEntry('lastName', input.lastName);
  mapEntry('company', input.company);
  mapEntry('title', input.title);
  mapEntry('email', input.email);
  mapEntry('phone', input.phone);
  mapEntry('mobilePhone', input.mobilePhone);
  mapEntry('street', input.street);
  mapEntry('city', input.city);
  mapEntry('state', input.state);
  mapEntry('postalCode', input.postalCode);
  mapEntry('country', input.country);
  mapEntry('leadSource', input.leadSource);
  mapEntry('status', input.status);
  mapEntry('rating', input.rating);
  mapEntry('industry', input.industry);
  mapEntry('website', input.website);
  mapEntry('description', input.description);

  return payload;
}

async function findUserIdByEmail(email: string): Promise<string | null> {
  const userQuery = `SELECT Id FROM User WHERE Email = '${escapeSoql(email)}' LIMIT 1`;
  const userResult = await querySalesforce<{ Id: string }>(userQuery);

  if (userResult.records.length > 0) {
    return userResult.records[0].Id;
  }

  return null;
}

export class SalesforceLeadAdapter implements CrmLeadAdapter {
  async listLeads(filters: CrmLeadFilters): Promise<CrmLeadQueryResult> {
    const conditions: string[] = [];

    if (filters.ownerEmail) {
      const ownerId = await findUserIdByEmail(filters.ownerEmail);
      if (ownerId) {
        conditions.push(`${SALESFORCE_LEAD_FIELD_MAP.ownerId} = '${ownerId}'`);
      }
    }

    if (filters.status) {
      conditions.push(`${SALESFORCE_LEAD_FIELD_MAP.status} = '${escapeSoql(filters.status)}'`);
    }

    if (filters.search) {
      const searchTerm = escapeSoql(filters.search);
      conditions.push(
        `(${SALESFORCE_LEAD_FIELD_MAP.firstName} LIKE '%${searchTerm}%' OR ${SALESFORCE_LEAD_FIELD_MAP.lastName} LIKE '%${searchTerm}%' OR ${SALESFORCE_LEAD_FIELD_MAP.company} LIKE '%${searchTerm}%' OR ${SALESFORCE_LEAD_FIELD_MAP.email} LIKE '%${searchTerm}%')`,
      );
    }

    const whereClause = conditions.length > 0 ? ` WHERE ${conditions.join(' AND ')}` : '';
    const limit = filters.limit || 50;
    const soql = `SELECT ${LEAD_SELECT_FIELDS.join(', ')} FROM Lead${whereClause} ORDER BY ${SALESFORCE_LEAD_FIELD_MAP.createdAt} DESC LIMIT ${limit}`;

    const result = await querySalesforce<Record<string, any>>(soql);

    return {
      records: result.records.map(mapSalesforceRecordToLead),
      totalSize: result.totalSize,
      done: result.done,
    };
  }

  async findLeadByEmail(email: string): Promise<CrmLead | null> {
    const query = `SELECT ${LEAD_SELECT_FIELDS.join(', ')} FROM Lead WHERE ${SALESFORCE_LEAD_FIELD_MAP.email} = '${escapeSoql(email)}' LIMIT 1`;
    const result = await querySalesforce<Record<string, any>>(query);

    if (result.records.length === 0) {
      return null;
    }

    return mapSalesforceRecordToLead(result.records[0]);
  }

  async findLeadByPhone(phone: string): Promise<CrmLead | null> {
    const query = `SELECT ${LEAD_SELECT_FIELDS.join(', ')} FROM Lead WHERE ${SALESFORCE_LEAD_FIELD_MAP.phone} = '${escapeSoql(phone)}' LIMIT 1`;
    const result = await querySalesforce<Record<string, any>>(query);

    if (result.records.length === 0) {
      return null;
    }

    return mapSalesforceRecordToLead(result.records[0]);
  }

  async createLead(input: CrmLeadInput): Promise<CrmLead> {
    const payload = buildCreatePayload(input);
    const result = await createRecord('Lead', payload);

    return {
      id: result.id,
      ...input,
      externalUrl: `${SF_LOGIN_URL}/${result.id}`,
    };
  }
}
