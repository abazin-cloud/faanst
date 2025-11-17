import 'server-only';

import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import {
  pgTable,
  text,
  numeric,
  integer,
  timestamp,
  pgEnum,
  serial
} from 'drizzle-orm/pg-core';
import { count, eq, ilike, desc } from 'drizzle-orm';
import { createInsertSchema } from 'drizzle-zod';

export const db = drizzle(neon(process.env.POSTGRES_URL!));

export const statusEnum = pgEnum('status', ['active', 'inactive', 'archived']);
export const leadStatusEnum = pgEnum('lead_status', ['hot', 'warm', 'cold']);

export const products = pgTable('products', {
  id: serial('id').primaryKey(),
  imageUrl: text('image_url').notNull(),
  name: text('name').notNull(),
  status: statusEnum('status').notNull(),
  price: numeric('price', { precision: 10, scale: 2 }).notNull(),
  stock: integer('stock').notNull(),
  availableAt: timestamp('available_at').notNull()
});

export type SelectProduct = typeof products.$inferSelect;
export const insertProductSchema = createInsertSchema(products);

export async function getProducts(
  search: string,
  offset: number
): Promise<{
  products: SelectProduct[];
  newOffset: number | null;
  totalProducts: number;
}> {
  // Always search the full table, not per page
  if (search) {
    return {
      products: await db
        .select()
        .from(products)
        .where(ilike(products.name, `%${search}%`))
        .limit(1000),
      newOffset: null,
      totalProducts: 0
    };
  }

  if (offset === null) {
    return { products: [], newOffset: null, totalProducts: 0 };
  }

  let totalProducts = await db.select({ count: count() }).from(products);
  let moreProducts = await db.select().from(products).limit(5).offset(offset);
  let newOffset = moreProducts.length >= 5 ? offset + 5 : null;

  return {
    products: moreProducts,
    newOffset,
    totalProducts: totalProducts[0].count
  };
}

export async function deleteProductById(id: number) {
  await db.delete(products).where(eq(products.id, id));
}

export const leads = pgTable('leads', {
  id: serial('id').primaryKey(),
  companyName: text('company_name').notNull(),
  contactName: text('contact_name').notNull(),
  email: text('email').notNull(),
  phone: text('phone'),
  estimatedValue: numeric('estimated_value', { precision: 10, scale: 2 }).notNull(),
  status: leadStatusEnum('status').notNull().default('cold'),
  notes: text('notes'),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow()
});

export type SelectLead = typeof leads.$inferSelect;
export const insertLeadSchema = createInsertSchema(leads);

// Add lead functions at the end of the file
export async function getLeads(limit: number = 10): Promise<SelectLead[]> {
  return await db
    .select()
    .from(leads)
    .orderBy(desc(leads.createdAt))
    .limit(limit);
}

export async function getLeadsCount(): Promise<number> {
  const result = await db.select({ count: count() }).from(leads);
  return result[0].count;
}

export async function createLead(data: typeof leads.$inferInsert) {
  console.log('Creating lead with data:', data);
  try {
    const [newLead] = await db.insert(leads).values(data).returning();
    console.log('Lead created in database:', newLead);
    return newLead;
  } catch (error) {
    console.error('Database error creating lead:', error);
    throw error;
  }
}

export async function deleteLeadById(id: number) {
  await db.delete(leads).where(eq(leads.id, id));
}