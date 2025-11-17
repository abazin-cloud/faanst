'use server';

import { updateLead, createAccount, createOpportunity, getLeadById } from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function updateLeadQualificationStatus(leadId: number, status: 'nouveau' | 'qualifie' | 'transforme') {
  try {
    await updateLead(leadId, { qualificationStatus: status });
    revalidatePath('/leads');
    revalidatePath('/');
    return { success: true };
  } catch (error) {
    console.error('Error updating lead qualification status:', error);
    return { success: false, error: 'Failed to update lead status' };
  }
}

export async function convertLeadToAccountAndOpportunity(leadId: number) {
  try {
    const lead = await getLeadById(leadId);
    
    if (!lead) {
      return { success: false, error: 'Lead not found' };
    }

    if (lead.qualificationStatus === 'transforme') {
      return { success: false, error: 'Lead already converted' };
    }

    // Create account from lead
    const account = await createAccount({
      companyName: lead.companyName,
      contactName: lead.contactName,
      email: lead.email,
      phone: lead.phone,
      address: null,
      website: null,
      industry: null
    });

    // Create opportunity from lead
    const opportunity = await createOpportunity({
      title: `Opportunité - ${lead.companyName}`,
      accountId: account.id,
      amount: lead.estimatedValue,
      stage: 'qualification',
      probability: 25,
      expectedCloseDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      description: lead.notes
    });

    // Update lead status to transformed and link to account/opportunity
    await updateLead(leadId, {
      qualificationStatus: 'transforme',
      convertedToAccountId: account.id,
      convertedToOpportunityId: opportunity.id
    });

    revalidatePath('/leads');
    revalidatePath('/customers');
    revalidatePath('/');
    
    return { 
      success: true, 
      accountId: account.id, 
      opportunityId: opportunity.id 
    };
  } catch (error) {
    console.error('Error converting lead:', error);
    return { success: false, error: 'Failed to convert lead' };
  }
}

