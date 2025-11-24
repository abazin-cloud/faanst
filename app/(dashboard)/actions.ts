'use server';

import { deleteProductById, createLead, db, leads } from '@/lib/db';
import { pushLeadToSalesforce } from '@/lib/salesforce-lead-sync';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { desc } from 'drizzle-orm';

export async function deleteProduct(formData: FormData) {
  // let id = Number(formData.get('id'));
  // await deleteProductById(id);
  // revalidatePath('/');
}

const leadFormSchema = z.object({
  companyName: z.string().min(1, 'Company name is required'),
  contactName: z.string().min(1, 'Contact name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  estimatedValue: z.string().min(1, 'Estimated value is required'),
  status: z.enum(['hot', 'warm', 'cold']),
  notes: z.string().optional(),
});

export async function addLead(formData: FormData) {
  try {
    const rawData = {
      companyName: formData.get('companyName'),
      contactName: formData.get('contactName'),
      email: formData.get('email'),
      phone: formData.get('phone') || '',
      estimatedValue: formData.get('estimatedValue'),
      status: formData.get('status'),
      notes: formData.get('notes') || '',
    };

    console.log('Raw form data:', rawData);

    const validatedData = leadFormSchema.parse(rawData);
    
    console.log('Validated data:', validatedData);

    // Create lead in local database
    await createLead({
      companyName: validatedData.companyName,
      contactName: validatedData.contactName,
      email: validatedData.email,
      phone: validatedData.phone || null,
      estimatedValue: validatedData.estimatedValue,
      status: validatedData.status,
      notes: validatedData.notes || null,
    });

    console.log('Lead created successfully in local DB!');

    // Get the newly created lead
    const newLeads = await db
      .select()
      .from(leads)
      .orderBy(desc(leads.createdAt))
      .limit(1);

    if (newLeads.length > 0) {
      const newLead = newLeads[0];
      
      // Push to Salesforce (async, don't wait for it)
      try {
        console.log('Syncing lead to Salesforce...');
        await pushLeadToSalesforce(newLead);
        console.log('Lead synced to Salesforce successfully!');
      } catch (sfError) {
        // Log error but don't fail the entire operation
        console.error('Failed to sync lead to Salesforce:', sfError);
        console.warn('Lead was created locally but not in Salesforce. You can sync it later.');
      }
    }

    revalidatePath('/');
    revalidatePath('/leads');
  } catch (error) {
    console.error('Error adding lead:', error);
    throw error;
  }
}
