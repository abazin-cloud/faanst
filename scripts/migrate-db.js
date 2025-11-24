#!/usr/bin/env node

/**
 * Database Migration Script for Neon
 * This script applies the Lead Management schema to your Neon database
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting Neon Database Migration...\n');

// Load environment variables from .env.local
const envLocalPath = path.join(__dirname, '..', '.env.local');

if (!fs.existsSync(envLocalPath)) {
  console.error('❌ Error: .env.local file not found!');
  console.error('Make sure you have your Neon database URL in .env.local');
  process.exit(1);
}

// Read .env.local file
const envContent = fs.readFileSync(envLocalPath, 'utf8');
const envLines = envContent.split('\n');

// Parse environment variables
envLines.forEach(line => {
  const trimmedLine = line.trim();
  if (trimmedLine && !trimmedLine.startsWith('#')) {
    const [key, ...valueParts] = trimmedLine.split('=');
    if (key && valueParts.length > 0) {
      const value = valueParts.join('=').trim();
      // Remove quotes if present
      const cleanValue = value.replace(/^["']|["']$/g, '');
      process.env[key.trim()] = cleanValue;
    }
  }
});

// Check if POSTGRES_URL is set
if (!process.env.POSTGRES_URL) {
  console.error('❌ Error: POSTGRES_URL not found in .env.local');
  console.error('Please make sure your .env.local contains: POSTGRES_URL=your_neon_url');
  process.exit(1);
}

console.log('✅ Environment variables loaded');
console.log('📊 Database URL found:', process.env.POSTGRES_URL.substring(0, 30) + '...\n');

try {
  console.log('📋 Generating migration...');
  execSync('npx drizzle-kit generate', { 
    stdio: 'inherit',
    env: process.env
  });
  
  console.log('\n✨ Applying migration to Neon database...');
  execSync('npx drizzle-kit push', { 
    stdio: 'inherit',
    env: process.env
  });
  
  console.log('\n🎉 Migration completed successfully!');
  console.log('\nYour database now includes:');
  console.log('  • Updated leads table with qualification status');
  console.log('  • Accounts table');
  console.log('  • Opportunities table');
  console.log('  • Notes table');
  console.log('  • Tasks table');
  console.log('\n✅ You can now start your app with: pnpm dev');
  
} catch (error) {
  console.error('\n❌ Migration failed:', error.message);
  process.exit(1);
}






















