const { neon } = require('@neondatabase/serverless');
const bcrypt = require('bcryptjs');

async function testAuth() {
  console.log('\n=== Test d\'Authentification ===\n');

  // Vérifier la connexion à la base de données
  const sql = neon(process.env.POSTGRES_URL);

  try {
    // 1. Vérifier la structure de la table users
    console.log('1️⃣  Vérification de la structure de la table users...');
    const columns = await sql`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'users'
      ORDER BY ordinal_position;
    `;
    
    console.log('\nColonnes de la table users:');
    columns.forEach(col => {
      console.log(`  - ${col.column_name} (${col.data_type})`);
    });

    const hasPassword = columns.some(col => col.column_name === 'password');
    if (!hasPassword) {
      console.log('\n❌ ERREUR: La colonne password n\'existe pas!');
      console.log('💡 Solution: Exécutez la migration 0005_add_password_to_users.sql\n');
      return;
    }

    // 2. Lister tous les utilisateurs
    console.log('\n2️⃣  Liste des utilisateurs:');
    const users = await sql`
      SELECT id, name, email, 
             CASE WHEN password IS NULL THEN 'NON' ELSE 'OUI' END as has_password,
             email_verified
      FROM users;
    `;

    if (users.length === 0) {
      console.log('❌ Aucun utilisateur trouvé!');
      console.log('💡 Solution: Créez un utilisateur avec le script generate-password-hash.js\n');
      return;
    }

    users.forEach(user => {
      console.log(`\n  User ID: ${user.id}`);
      console.log(`  Nom: ${user.name}`);
      console.log(`  Email: ${user.email}`);
      console.log(`  Mot de passe: ${user.has_password}`);
      console.log(`  Email vérifié: ${user.email_verified || 'NON'}`);
    });

    // 3. Test de connexion avec un utilisateur spécifique
    console.log('\n3️⃣  Test de connexion...');
    const email = 'admin@example.com';
    const password = 'Admin123!';

    console.log(`Email testé: ${email}`);
    console.log(`Mot de passe testé: ${password}`);

    const [user] = await sql`
      SELECT id, name, email, password, email_verified
      FROM users
      WHERE email = ${email};
    `;

    if (!user) {
      console.log(`\n❌ Aucun utilisateur trouvé avec l'email: ${email}`);
      console.log('💡 Solution: Créez cet utilisateur avec le script generate-password-hash.js\n');
      return;
    }

    console.log('\n✓ Utilisateur trouvé');

    if (!user.password) {
      console.log('❌ L\'utilisateur n\'a pas de mot de passe!');
      console.log('💡 Solution: Mettez à jour l\'utilisateur avec un mot de passe hashé\n');
      return;
    }

    console.log('✓ Mot de passe défini dans la DB');

    // Tester la vérification du mot de passe
    const isValid = await bcrypt.compare(password, user.password);

    if (isValid) {
      console.log('✅ SUCCÈS: Le mot de passe correspond!');
      
      if (!user.email_verified) {
        console.log('\n⚠️  ATTENTION: L\'email n\'est pas vérifié');
        console.log('💡 L\'utilisateur ne pourra pas se connecter tant que l\'email n\'est pas vérifié');
        console.log(`💡 Solution: UPDATE users SET email_verified = NOW() WHERE email = '${email}';`);
      } else {
        console.log('✅ Email vérifié: L\'utilisateur peut se connecter!');
      }
    } else {
      console.log('❌ ERREUR: Le mot de passe ne correspond pas!');
      console.log('\n💡 Solutions possibles:');
      console.log('1. Le mot de passe dans la DB n\'est pas correct');
      console.log('2. Le hash n\'a pas été généré correctement');
      console.log('3. Régénérez le hash avec: node scripts/generate-password-hash.js');
    }

    // Afficher le hash stocké pour débogage
    console.log(`\nHash stocké (début): ${user.password.substring(0, 20)}...`);

  } catch (error) {
    console.error('\n❌ Erreur:', error.message);
  }

  console.log('\n');
}

// Charger les variables d'environnement depuis .env.local
const fs = require('fs');
const path = require('path');

try {
  const envPath = path.join(__dirname, '..', '.env.local');
  const envContent = fs.readFileSync(envPath, 'utf8');
  
  envContent.split('\n').forEach(line => {
    const trimmedLine = line.trim();
    if (trimmedLine && !trimmedLine.startsWith('#')) {
      const [key, ...valueParts] = trimmedLine.split('=');
      const value = valueParts.join('=').replace(/^["'](.*)["']$/, '$1');
      if (key && value) {
        process.env[key.trim()] = value.trim();
      }
    }
  });
} catch (error) {
  console.error('❌ Impossible de lire .env.local');
}

if (!process.env.POSTGRES_URL) {
  console.error('❌ POSTGRES_URL non définie dans .env.local');
  process.exit(1);
}

testAuth();

