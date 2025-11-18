const bcrypt = require('bcryptjs');

// Mot de passe à hasher
const password = 'Admin123!';

// Générer le hash
const saltRounds = 12;
const hash = bcrypt.hashSync(password, saltRounds);

console.log('\n=== Mot de passe hashé généré ===\n');
console.log('Mot de passe en clair:', password);
console.log('Hash bcrypt:', hash);
console.log('\n=== Requête SQL pour créer un utilisateur ===\n');

const email = 'admin@example.com';
const name = 'Admin User';

console.log(`INSERT INTO users (name, email, password, email_verified, created_at, updated_at)
VALUES (
  '${name}',
  '${email}',
  '${hash}',
  NOW(),
  NOW(),
  NOW()
);`);

console.log('\n=== Instructions ===');
console.log('1. Copiez la requête SQL ci-dessus');
console.log('2. Allez sur Neon Console > SQL Editor');
console.log('3. Collez et exécutez la requête');
console.log('4. Vous pourrez vous connecter avec:');
console.log('   Email:', email);
console.log('   Mot de passe:', password);
console.log('');

