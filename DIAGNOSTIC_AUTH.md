# 🔍 Diagnostic d'Authentification

## Problème : Impossible de se connecter

Suivez ces étapes pour diagnostiquer et résoudre le problème.

---

## 1️⃣ Vérifier la structure de la table users

Exécutez dans **Neon Console > SQL Editor** :

```sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'users'
ORDER BY ordinal_position;
```

**Colonnes attendues :**
- `id` (integer)
- `name` (text)
- `email` (text)
- `password` (text) ⚠️ **CRITIQUE**
- `email_verified` (timestamp)
- `image` (text)
- `created_at` (timestamp)
- `updated_at` (timestamp)

**Si la colonne `password` manque**, exécutez :

```sql
ALTER TABLE users ADD COLUMN password TEXT;
ALTER TABLE users ADD COLUMN email_verified TIMESTAMP;
ALTER TABLE users ADD COLUMN created_at TIMESTAMP DEFAULT NOW();
ALTER TABLE users ADD COLUMN updated_at TIMESTAMP DEFAULT NOW();
```

---

## 2️⃣ Vérifier les utilisateurs existants

```sql
SELECT 
  id, 
  name, 
  email, 
  CASE WHEN password IS NULL THEN 'NON' ELSE 'OUI' END as has_password,
  CASE WHEN email_verified IS NULL THEN 'NON' ELSE 'OUI' END as email_verified
FROM users;
```

**Problèmes courants :**

### A. Utilisateur sans mot de passe
Si `has_password = NON`, supprimez l'utilisateur et recréez-le :

```sql
DELETE FROM users WHERE email = 'admin@example.com';
```

### B. Email non vérifié
Si `email_verified = NON`, l'utilisateur ne peut pas se connecter. Solution :

```sql
UPDATE users SET email_verified = NOW() WHERE email = 'admin@example.com';
```

---

## 3️⃣ Créer un nouvel utilisateur de test

### Option A : Avec un mot de passe simple pour tester

```sql
-- Supprimer l'ancien utilisateur s'il existe
DELETE FROM users WHERE email = 'test@example.com';

-- Créer un nouvel utilisateur
-- Hash bcrypt pour le mot de passe: "Test123!"
INSERT INTO users (name, email, password, email_verified, created_at, updated_at)
VALUES (
  'Test User',
  'test@example.com',
  '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYBVr0qXqEm',
  NOW(),
  NOW(),
  NOW()
);
```

**Identifiants de connexion :**
- Email: `test@example.com`
- Mot de passe: `Test123!`

### Option B : Générer un nouveau hash

Exécutez dans votre terminal :

```bash
cd /Users/a.bazin/Documents/faanst/my-crm-auto
node -e "const bcrypt = require('bcryptjs'); console.log(bcrypt.hashSync('VotreMotDePasse', 12));"
```

Puis utilisez le hash généré dans la requête SQL ci-dessus.

---

## 4️⃣ Vérifier l'application Next.js

### A. Vérifier que bcryptjs est installé

```bash
cd /Users/a.bazin/Documents/faanst/my-crm-auto
pnpm list bcryptjs
```

Si non installé :

```bash
pnpm install
```

### B. Redémarrer le serveur

```bash
pnpm run dev
```

### C. Tester la connexion

1. Ouvrez `http://localhost:3000/login`
2. Utilisez les identifiants créés à l'étape 3
3. Vérifiez la console du navigateur (F12) pour les erreurs

---

## 5️⃣ Vérifier les logs NextAuth

Ajoutez dans `.env.local` :

```bash
NEXTAUTH_DEBUG=true
```

Redémarrez l'application et regardez les logs du serveur lors de la tentative de connexion.

---

## 🆘 Checklist Rapide

- [ ] La colonne `password` existe dans la table `users`
- [ ] L'utilisateur existe dans la base de données
- [ ] L'utilisateur a un mot de passe (hash bcrypt)
- [ ] L'utilisateur a `email_verified` défini (pas NULL)
- [ ] Le package `bcryptjs` est installé
- [ ] Le serveur Next.js est redémarré après l'installation
- [ ] Vous utilisez le bon email et mot de passe

---

## 🔧 Solution Rapide (Reset Complet)

Si rien ne fonctionne, reset complet :

```sql
-- 1. Supprimer tous les utilisateurs
TRUNCATE TABLE users CASCADE;

-- 2. Créer un utilisateur de test
INSERT INTO users (name, email, password, email_verified, created_at, updated_at)
VALUES (
  'Admin',
  'admin@test.com',
  '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYBVr0qXqEm',
  NOW(),
  NOW(),
  NOW()
);
```

**Identifiants :**
- Email: `admin@test.com`
- Mot de passe: `Test123!`

Redémarrez l'application et testez.


