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
import { count, eq, ilike, desc, and, asc } from 'drizzle-orm';
import { createInsertSchema } from 'drizzle-zod';

export const db = drizzle(neon(process.env.POSTGRES_URL!));

export const statusEnum = pgEnum('status', ['active', 'inactive', 'archived']);
export const leadStatusEnum = pgEnum('lead_status', ['hot', 'warm', 'cold']);
export const qualificationStatusEnum = pgEnum('qualification_status', ['nouveau', 'qualifie', 'transforme']);
export const opportunityStageEnum = pgEnum('opportunity_stage', ['prospection', 'qualification', 'proposition', 'negociation', 'gagne', 'perdu']);
export const taskStatusEnum = pgEnum('task_status', ['a_faire', 'en_cours', 'termine']);

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
  qualificationStatus: qualificationStatusEnum('qualification_status').notNull().default('nouveau'),
  notes: text('notes'),
  convertedToAccountId: integer('converted_to_account_id'),
  convertedToOpportunityId: integer('converted_to_opportunity_id'),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'date' }).defaultNow()
});

export const accounts = pgTable('accounts', {
  id: serial('id').primaryKey(),
  companyName: text('company_name').notNull(),
  contactName: text('contact_name').notNull(),
  email: text('email').notNull(),
  phone: text('phone'),
  address: text('address'),
  website: text('website'),
  industry: text('industry'),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'date' }).defaultNow()
});

export const opportunities = pgTable('opportunities', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  accountId: integer('account_id').notNull(),
  amount: numeric('amount', { precision: 10, scale: 2 }).notNull(),
  stage: opportunityStageEnum('stage').notNull().default('prospection'),
  probability: integer('probability').notNull().default(0),
  expectedCloseDate: timestamp('expected_close_date', { mode: 'date' }),
  description: text('description'),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'date' }).defaultNow()
});

export const notes = pgTable('notes', {
  id: serial('id').primaryKey(),
  entityType: text('entity_type').notNull(), // 'lead', 'account', 'opportunity'
  entityId: integer('entity_id').notNull(),
  content: text('content').notNull(),
  createdBy: text('created_by').notNull(),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow()
});

export const tasks = pgTable('tasks', {
  id: serial('id').primaryKey(),
  entityType: text('entity_type').notNull(), // 'lead', 'account', 'opportunity'
  entityId: integer('entity_id').notNull(),
  title: text('title').notNull(),
  description: text('description'),
  dueDate: timestamp('due_date', { mode: 'date' }),
  status: taskStatusEnum('status').notNull().default('a_faire'),
  priority: text('priority').notNull().default('normale'), // 'haute', 'normale', 'basse'
  assignedTo: text('assigned_to'),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow(),
  completedAt: timestamp('completed_at', { mode: 'date' })
});

export const vehicles = pgTable('vehicles', {
  id: serial('id').primaryKey(),
  model: text('model').notNull(),
  finish: text('finish').notNull(),
  basePrice: numeric('base_price', { precision: 10, scale: 2 }),
  description: text('description'),
  imageUrl: text('image_url'),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow()
});

export const vehicleOptions = pgTable('vehicle_options', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  category: text('category').notNull(), // 'option' or 'accessoire'
  price: numeric('price', { precision: 10, scale: 2 }).notNull(),
  description: text('description'),
  imageUrl: text('image_url'),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow()
});

export const vehicleConfigurations = pgTable('vehicle_configurations', {
  id: serial('id').primaryKey(),
  vehicleId: integer('vehicle_id').notNull(),
  customerName: text('customer_name'),
  customerEmail: text('customer_email'),
  selectedOptions: text('selected_options'), // JSON string of option IDs
  financingType: text('financing_type'), // 'comptant', 'credit', 'leasing'
  financingDuration: integer('financing_duration'), // in months
  financingDownPayment: numeric('financing_down_payment', { precision: 10, scale: 2 }),
  totalPrice: numeric('total_price', { precision: 10, scale: 2 }).notNull(),
  status: text('status').notNull().default('brouillon'), // 'brouillon', 'envoye', 'accepte'
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'date' }).defaultNow()
});

// Type definitions
export type SelectLead = typeof leads.$inferSelect;
export type SelectAccount = typeof accounts.$inferSelect;
export type SelectOpportunity = typeof opportunities.$inferSelect;
export type SelectNote = typeof notes.$inferSelect;
export type SelectTask = typeof tasks.$inferSelect;
export type SelectVehicle = typeof vehicles.$inferSelect;
export type SelectVehicleOption = typeof vehicleOptions.$inferSelect;
export type SelectVehicleConfiguration = typeof vehicleConfigurations.$inferSelect;

export const insertLeadSchema = createInsertSchema(leads);
export const insertAccountSchema = createInsertSchema(accounts);
export const insertOpportunitySchema = createInsertSchema(opportunities);
export const insertNoteSchema = createInsertSchema(notes);
export const insertTaskSchema = createInsertSchema(tasks);
export const insertVehicleSchema = createInsertSchema(vehicles);
export const insertVehicleOptionSchema = createInsertSchema(vehicleOptions);
export const insertVehicleConfigurationSchema = createInsertSchema(vehicleConfigurations);

export async function getVehicles(): Promise<SelectVehicle[]> {
  return await db.select().from(vehicles).orderBy(asc(vehicles.model), asc(vehicles.finish));
}

export async function replaceVehicles(entries: Array<{
  model: string;
  finish: string;
  basePrice?: number | null;
  description?: string | null;
  imageUrl?: string | null;
}>) {
  // Delete all existing vehicles
  await db.delete(vehicles);
  
  // Insert new vehicles if any
  if (entries.length > 0) {
    await db.insert(vehicles).values(
      entries.map((entry) => ({
        model: entry.model,
        finish: entry.finish,
        basePrice: entry.basePrice?.toString() || null,
        description: entry.description || null,
        imageUrl: entry.imageUrl || null,
      }))
    );
  }
}

// Lead functions
export async function getLeads(limit: number = 10): Promise<SelectLead[]> {
  return await db
    .select()
    .from(leads)
    .orderBy(desc(leads.createdAt))
    .limit(limit);
}

export async function getAllLeads(): Promise<SelectLead[]> {
  return await db
    .select()
    .from(leads)
    .orderBy(desc(leads.createdAt));
}

export async function getLeadById(id: number): Promise<SelectLead | undefined> {
  const result = await db.select().from(leads).where(eq(leads.id, id));
  return result[0];
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

export async function updateLead(id: number, data: Partial<typeof leads.$inferInsert>) {
  const [updatedLead] = await db
    .update(leads)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(leads.id, id))
    .returning();
  return updatedLead;
}

export async function deleteLeadById(id: number) {
  await db.delete(leads).where(eq(leads.id, id));
}

// Account functions
export async function getAccounts(): Promise<SelectAccount[]> {
  return await db
    .select()
    .from(accounts)
    .orderBy(desc(accounts.createdAt));
}

export async function getAccountById(id: number): Promise<SelectAccount | undefined> {
  const result = await db.select().from(accounts).where(eq(accounts.id, id));
  return result[0];
}

export async function createAccount(data: typeof accounts.$inferInsert) {
  const [newAccount] = await db.insert(accounts).values(data).returning();
  return newAccount;
}

// Opportunity functions
export async function getOpportunities(): Promise<SelectOpportunity[]> {
  return await db
    .select()
    .from(opportunities)
    .orderBy(desc(opportunities.createdAt));
}

export async function getOpportunitiesByAccountId(accountId: number): Promise<SelectOpportunity[]> {
  return await db
    .select()
    .from(opportunities)
    .where(eq(opportunities.accountId, accountId))
    .orderBy(desc(opportunities.createdAt));
}

export async function createOpportunity(data: typeof opportunities.$inferInsert) {
  const [newOpportunity] = await db.insert(opportunities).values(data).returning();
  return newOpportunity;
}

export async function updateOpportunity(id: number, data: Partial<typeof opportunities.$inferInsert>) {
  const [updatedOpportunity] = await db
    .update(opportunities)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(opportunities.id, id))
    .returning();
  return updatedOpportunity;
}

// Notes functions
export async function getNotesByEntity(entityType: string, entityId: number): Promise<SelectNote[]> {
  return await db
    .select()
    .from(notes)
    .where(and(eq(notes.entityType, entityType), eq(notes.entityId, entityId)))
    .orderBy(desc(notes.createdAt));
}

export async function createNote(data: typeof notes.$inferInsert) {
  const [newNote] = await db.insert(notes).values(data).returning();
  return newNote;
}

export async function deleteNoteById(id: number) {
  await db.delete(notes).where(eq(notes.id, id));
}

// Tasks functions
export async function getTasksByEntity(entityType: string, entityId: number): Promise<SelectTask[]> {
  return await db
    .select()
    .from(tasks)
    .where(and(eq(tasks.entityType, entityType), eq(tasks.entityId, entityId)))
    .orderBy(desc(tasks.createdAt));
}

export async function createTask(data: typeof tasks.$inferInsert) {
  const [newTask] = await db.insert(tasks).values(data).returning();
  return newTask;
}

export async function updateTask(id: number, data: Partial<typeof tasks.$inferInsert>) {
  const [updatedTask] = await db
    .update(tasks)
    .set(data)
    .where(eq(tasks.id, id))
    .returning();
  return updatedTask;
}

export async function deleteTaskById(id: number) {
  await db.delete(tasks).where(eq(tasks.id, id));
}

// Vehicle Options functions
export async function getVehicleOptions(): Promise<SelectVehicleOption[]> {
  return await db
    .select()
    .from(vehicleOptions)
    .orderBy(asc(vehicleOptions.category), asc(vehicleOptions.name));
}

export async function getVehicleOptionsByCategory(category: string): Promise<SelectVehicleOption[]> {
  return await db
    .select()
    .from(vehicleOptions)
    .where(eq(vehicleOptions.category, category))
    .orderBy(asc(vehicleOptions.name));
}

export async function createVehicleOption(data: typeof vehicleOptions.$inferInsert) {
  const [newOption] = await db.insert(vehicleOptions).values(data).returning();
  return newOption;
}

export async function deleteVehicleOptionById(id: number) {
  await db.delete(vehicleOptions).where(eq(vehicleOptions.id, id));
}

// Vehicle Configuration functions
export async function getVehicleConfigurations(): Promise<SelectVehicleConfiguration[]> {
  return await db
    .select()
    .from(vehicleConfigurations)
    .orderBy(desc(vehicleConfigurations.createdAt));
}

export async function getVehicleConfigurationById(id: number): Promise<SelectVehicleConfiguration | undefined> {
  const result = await db.select().from(vehicleConfigurations).where(eq(vehicleConfigurations.id, id));
  return result[0];
}

export async function createVehicleConfiguration(data: typeof vehicleConfigurations.$inferInsert) {
  const [newConfig] = await db.insert(vehicleConfigurations).values(data).returning();
  return newConfig;
}

export async function updateVehicleConfiguration(id: number, data: Partial<typeof vehicleConfigurations.$inferInsert>) {
  const [updatedConfig] = await db
    .update(vehicleConfigurations)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(vehicleConfigurations.id, id))
    .returning();
  return updatedConfig;
}

export async function deleteVehicleConfigurationById(id: number) {
  await db.delete(vehicleConfigurations).where(eq(vehicleConfigurations.id, id));
}