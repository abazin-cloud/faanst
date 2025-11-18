#!/usr/bin/env node

/**
 * Script pour vérifier et appliquer la migration du configurateur
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
  console.error('⚠️  Could not load .env.local, using system environment variables');
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function main() {
  if (!process.env.POSTGRES_URL) {
    console.error('❌ POSTGRES_URL is not set in .env.local');
    process.exit(1);
  }

  const sql = neon(process.env.POSTGRES_URL);

  try {
    console.log('🔌 Connexion à la base de données Neon...');
    console.log('✅ Connecté à Neon PostgreSQL\n');

    // Vérifier si les colonnes existent
    console.log('🔍 Vérification de la structure de la table vehicles...');
    const columns = await sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'vehicles'
      ORDER BY ordinal_position
    `;

    console.log('📋 Colonnes actuelles de la table vehicles:');
    columns.forEach(col => {
      console.log(`  - ${col.column_name} (${col.data_type})`);
    });

    const hasBasePrice = columns.some(col => col.column_name === 'base_price');
    const hasDescription = columns.some(col => col.column_name === 'description');
    const hasImageUrl = columns.some(col => col.column_name === 'image_url');

    if (hasBasePrice && hasDescription && hasImageUrl) {
      console.log('\n✅ Toutes les colonnes nécessaires sont présentes !');
      
      // Vérifier s'il y a des données avec images
      const vehiclesWithImages = await sql`
        SELECT COUNT(*) as count FROM vehicles WHERE image_url IS NOT NULL
      `;
      
      console.log(`\n📊 Véhicules avec images: ${vehiclesWithImages[0].count}`);
      
      if (vehiclesWithImages[0].count === '0') {
        console.log('\n⚠️  Aucun véhicule n\'a d\'image URL.');
        console.log('💡 Vous devez ré-importer votre fichier CSV avec les images.');
        console.log('📄 Utilisez le fichier exemple-vehicules-complet.csv fourni.');
      }
    } else {
      console.log('\n⚠️  Colonnes manquantes détectées. Application de la migration...\n');

      // Lire et exécuter la migration
      const migrationPath = join(__dirname, '..', 'drizzle', '0002_vehicle_configurator.sql');
      const migrationSQL = readFileSync(migrationPath, 'utf-8');

      // Exécuter la migration (il faut la diviser en requêtes séparées pour Neon)
      const statements = migrationSQL
        .split(';')
        .map(s => s.trim())
        .filter(s => s && !s.startsWith('--') && !s.startsWith('COMMENT'));
      
      for (const statement of statements) {
        if (statement.length > 0) {
          await sql.unsafe(statement);
        }
      }
      
      console.log('✅ Migration appliquée avec succès !');
      console.log('\n💡 Vous devez maintenant ré-importer votre fichier CSV avec les colonnes complètes:');
      console.log('   - Modèle');
      console.log('   - Finition');
      console.log('   - Prix');
      console.log('   - Description');
      console.log('   - Image\n');
    }

    // Afficher un aperçu des véhicules
    const vehicles = await sql`SELECT * FROM vehicles LIMIT 3`;
    if (vehicles.length > 0) {
      console.log('\n📋 Aperçu des véhicules en base:');
      vehicles.forEach((v, i) => {
        console.log(`\n  ${i + 1}. ${v.model} - ${v.finish}`);
        console.log(`     Prix: ${v.base_price || 'Non défini'}`);
        console.log(`     Description: ${v.description || 'Non définie'}`);
        console.log(`     Image: ${v.image_url ? '✅' : '❌'}`);
      });
    }

  } catch (error) {
    console.error('\n❌ Erreur:', error.message);
    console.error(error);
    process.exit(1);
  }

  console.log('\n✅ Vérification terminée.');
}

main();

