'use server';

import { deleteProductById, createLead } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

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

    await createLead({
      companyName: validatedData.companyName,
      contactName: validatedData.contactName,
      email: validatedData.email,
      phone: validatedData.phone || null,
      estimatedValue: validatedData.estimatedValue,
      status: validatedData.status,
      notes: validatedData.notes || null,
    });

    console.log('Lead created successfully!');
    revalidatePath('/');
  } catch (error) {
    console.error('Error adding lead:', error);
    throw error;
  }
}
