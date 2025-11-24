/**
 * Script pour créer un utilisateur dans la base de données
 * Usage: node scripts/create-user.js
 */

const { neon } = require('@neondatabase/serverless');
const { drizzle } = require('drizzle-orm/neon-http');
const { hash } = require('bcryptjs');
const fs = require('fs');
const path = require('path');
const { pgTable, serial, text, timestamp } = require('drizzle-orm/pg-core');
const { eq } = require('drizzle-orm');

// Load environment variables manually from .env.local
function loadEnvFile() {
  const envPath = path.join(__dirname, '..', '.env.local');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split('\n').forEach(line => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...valueParts] = trimmed.split('=');
        if (key && valueParts.length > 0) {
          const value = valueParts.join('=').trim();
          // Remove quotes if present
          process.env[key.trim()] = value.replace(/^["']|["']$/g, '');
        }
      }
    });
  }
}

loadEnvFile();

// Define users table
const users = pgTable('users', {
  id: serial('id').primaryKey(),
  name: text('name'),
  email: text('email').notNull().unique(),
  password: text('password').notNull(),
  emailVerified: timestamp('email_verified', { mode: 'date' }),
  image: text('image'),
  salesforceEmail: text('salesforce_email'),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'date' }).defaultNow()
});

// Configuration de l'utilisateur à créer
const USER_CONFIG = {
  name: 'Antonin Bazi',
  email: 'antonin.bazi@gmail.com',
  password: 'AntoninBazin91120'
};

async function createUser() {
  try {
    console.log('🔄 Connexion à la base de données...');
    
    const connectionString = process.env.POSTGRES_URL || process.env.DATABASE_URL || process.env.POSTGRES_PRISMA_URL;
    
    if (!connectionString) {
      throw new Error('❌ POSTGRES_URL non défini dans .env.local');
    }

    const db = drizzle(neon(connectionString));

    // Vérifier si l'utilisateur existe déjà
    console.log(`🔍 Vérification si ${USER_CONFIG.email} existe déjà...`);
    const existingUsers = await db.select().from(users).where(eq(users.email, USER_CONFIG.email));

    if (existingUsers.length > 0) {
      console.log(`⚠️  L'utilisateur ${USER_CONFIG.email} existe déjà avec l'ID: ${existingUsers[0].id}`);
      console.log('   Vous pouvez maintenant vous connecter avec cet email.');
      return;
    }

    // Hasher le mot de passe
    console.log('🔐 Hashage du mot de passe...');
    const hashedPassword = await hash(USER_CONFIG.password, 12);

    // Créer l'utilisateur avec email vérifié
    console.log('👤 Création de l\'utilisateur...');
    const result = await db.insert(users).values({
      name: USER_CONFIG.name,
      email: USER_CONFIG.email,
      password: hashedPassword,
      emailVerified: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    }).returning();

    if (result.length > 0) {
      const user = result[0];
      console.log('\n✅ Utilisateur créé avec succès !');
      console.log('');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('📋 Détails de connexion :');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log(`   ID        : ${user.id}`);
      console.log(`   Nom       : ${user.name}`);
      console.log(`   Email     : ${user.email}`);
      console.log(`   Mot de passe : ${USER_CONFIG.password}`);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('');
      console.log('🚀 Vous pouvez maintenant :');
      console.log('   1. Aller sur http://localhost:3000/login');
      console.log(`   2. Se connecter avec ${user.email}`);
      console.log('   3. Voir vos 5 leads Salesforce !');
      console.log('');
    }

  } catch (error) {
    console.error('❌ Erreur lors de la création de l\'utilisateur :');
    console.error(error.message);
    process.exit(1);
  }
}

// Exécuter le script
createUser();

