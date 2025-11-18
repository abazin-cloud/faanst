#!/usr/bin/env node

/**
 * Script pour vider la table vehicles avant un nouvel import
 */

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { neon } from '@neondatabase/serverless';

// Load environment variables from .env.local manually
const envPath = join(dirname(fileURLToPath(import.meta.url)), '..', '.env.local');
try {
  const envContent = readFileSync(envPath, 'utf-8');
  envContent.split('\n').forEach(line => {
    const match = line.match(/^([^=:#]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      const value = match[2].trim().replace(/^["']|["']$/g, '');
      process.env[key] = value;
    }
  });
} catch (error) {
  console.error('⚠️  Could not load .env.local');
}

async function main() {
  const sql = neon(process.env.POSTGRES_URL);

  console.log('⚠️  Ce script va supprimer TOUS les véhicules de la base de données.\n');
  
  // Count current vehicles
  const count = await sql`SELECT COUNT(*) as count FROM vehicles`;
  console.log(`📊 Véhicules actuels en base: ${count[0].count}\n`);

  if (count[0].count === '0') {
    console.log('✅ La table est déjà vide. Rien à faire.');
    return;
  }

  console.log('🗑️  Suppression de tous les véhicules...');
  await sql`DELETE FROM vehicles`;
  
  const newCount = await sql`SELECT COUNT(*) as count FROM vehicles`;
  console.log(`✅ Suppression terminée. Véhicules restants: ${newCount[0].count}\n`);
  
  console.log('💡 Vous pouvez maintenant importer votre nouveau fichier CSV sur /settings');
  console.log('📄 Utilisez exemple-vehicules-complet.csv pour un import rapide avec images.');
}

main();



