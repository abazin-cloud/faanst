const bcrypt = require('bcryptjs');

// Hash actuel dans votre DB
const hash = '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYBVr0qXqEm';

// Mots de passe à tester
const passwords = ['Test123!', 'Admin123!', 'test123!', 'admin123!'];

console.log('\n=== Vérification du hash ===\n');
console.log('Hash:', hash);
console.log('\nTests de correspondance:\n');

passwords.forEach(pwd => {
  const isMatch = bcrypt.compareSync(pwd, hash);
  console.log(`${pwd.padEnd(15)} → ${isMatch ? '✅ CORRESPOND' : '❌ Ne correspond pas'}`);
});

console.log('\n=== Génération de nouveaux hash ===\n');

// Générer de nouveaux hash
const newPasswords = {
  'admin@test.com': 'Admin2024!',
  'test@example.com': 'Test2024!'
};

Object.entries(newPasswords).forEach(([email, password]) => {
  const newHash = bcrypt.hashSync(password, 12);
  console.log(`Email: ${email}`);
  console.log(`Mot de passe: ${password}`);
  console.log(`Hash: ${newHash}`);
  console.log('');
  console.log(`INSERT INTO users (name, email, password, image, email_verified, created_at, updated_at)`);
  console.log(`VALUES (`);
  console.log(`  '${email.split('@')[0]}',`);
  console.log(`  '${email}',`);
  console.log(`  '${newHash}',`);
  console.log(`  NULL,`);
  console.log(`  NOW(),`);
  console.log(`  NOW(),`);
  console.log(`  NOW()`);
  console.log(`);\n`);
  console.log('---\n');
});

