#!/usr/bin/env node

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

  console.log('🔍 Vérification des URLs des images des véhicules...\n');

  const vehicles = await sql`
    SELECT id, model, finish, image_url, base_price
    FROM vehicles 
    ORDER BY id 
    LIMIT 5
  `;

  vehicles.forEach((v, i) => {
    console.log(`${i + 1}. ${v.model} - ${v.finish}`);
    console.log(`   Prix: ${v.base_price}`);
    console.log(`   Image URL: ${v.image_url || 'AUCUNE'}`);
    console.log(`   Longueur URL: ${v.image_url ? v.image_url.length : 0}`);
    console.log('');
  });

  // Check format
  console.log('📊 Statistiques:');
  const stats = await sql`
    SELECT 
      COUNT(*) as total,
      COUNT(image_url) as with_url,
      AVG(LENGTH(image_url)) as avg_length
    FROM vehicles
  `;
  console.log(`Total véhicules: ${stats[0].total}`);
  console.log(`Avec URL: ${stats[0].with_url}`);
  console.log(`Longueur moyenne URL: ${Math.round(stats[0].avg_length || 0)}`);
}

main();



