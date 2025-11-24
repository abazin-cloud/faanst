# Guide d'Installation - Système d'Authentification

## 🎯 Vue d'ensemble

Système d'authentification complet avec NextAuth.js incluant :
- ✅ Inscription avec email/password
- ✅ Connexion sécurisée
- ✅ Validation d'email obligatoire
- ✅ Protection des routes du dashboard
- ✅ Gestion de session avec JWT

## 📋 Installation - Étape par Étape

### 1. Installer les dépendances

```bash
cd my-crm-auto

# Installer bcryptjs pour le hashage des mots de passe
npm install bcryptjs
npm install --save-dev @types/bcryptjs

# OU avec pnpm
pnpm add bcryptjs
pnpm add -D @types/bcryptjs
```

### 2. Appliquer les migrations de base de données

```bash
# Option 1 : Via SQL Editor de Neon (RECOMMANDÉ)
# 1. Allez sur https://console.neon.tech/
# 2. Sélectionnez votre projet
# 3. Cliquez sur "SQL Editor"
# 4. Copiez et exécutez le contenu de:
#    drizzle/0004_create_auth_tables.sql

# Option 2 : Via psql
psql $POSTGRES_URL -f drizzle/0004_create_auth_tables.sql
```

### 3. Configurer les variables d'environnement

Ajoutez/Modifiez dans `.env.local` :

```bash
# URL de votre base de données Neon (déjà configuré normalement)
POSTGRES_URL=votre_url_postgresql

# Configuration NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=votre_secret_aleatoire_tres_long

# Pour l'envoi d'emails (optionnel - voir section ci-dessous)
# RESEND_API_KEY=your_resend_api_key
```

**Générer un NEXTAUTH_SECRET** :
```bash
# Méthode 1 : Avec OpenSSL
openssl rand -base64 32

# Méthode 2 : Avec Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### 4. Mettre à jour le journal des migrations

Mise à jour déjà effectuée dans `drizzle/meta/_journal.json`

### 5. Démarrer l'application

```bash
npm run dev
# ou
pnpm dev
```

## 🔐 Structure de la Base de Données

### Table `users`
```sql
- id (serial, primary key)
- name (text)
- email (text, unique, not null)
- password (text, not null) -- hashé avec bcrypt
- email_verified (timestamp)
- image (text)
- created_at (timestamp)
- updated_at (timestamp)
```

### Table `verification_tokens`
```sql
- identifier (text, not null) -- email de l'utilisateur
- token (text, not null)
- expires (timestamp, not null)
- PRIMARY KEY (identifier, token)
```

### Table `sessions`
```sql
- id (serial, primary key)
- session_token (text, unique, not null)
- user_id (integer, foreign key -> users.id)
- expires (timestamp, not null)
```

## 🚀 Utilisation

### Inscription d'un nouvel utilisateur

1. Allez sur `/register`
2. Remplissez le formulaire :
   - Nom complet
   - Email
   - Mot de passe (min 8 caractères)
   - Confirmation du mot de passe
3. Cliquez sur "S'inscrire"
4. Un email de vérification est "envoyé" (voir logs pour l'URL)

### Vérification de l'email

**En développement** : L'URL de vérification est affichée dans les logs du serveur

**En production** : Configurez l'envoi d'emails (voir section ci-dessous)

URL format : `/verify-email?token=xxx&email=user@example.com`

### Connexion

1. Allez sur `/login`
2. Entrez votre email et mot de passe
3. Vous êtes redirigé vers le dashboard `/`

### Déconnexion

Cliquez sur votre avatar en haut à droite → "Déconnexion"

## 📧 Configuration de l'Envoi d'Emails

### Option 1 : Resend (Recommandé)

```bash
# Installer Resend
npm install resend
```

Créez `lib/email.ts` :

```typescript
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendVerificationEmail(email: string, token: string) {
  const verificationUrl = `${process.env.NEXTAUTH_URL}/verify-email?token=${token}&email=${encodeURIComponent(email)}`;

  await resend.emails.send({
    from: 'onboarding@resend.dev',
    to: email,
    subject: 'Vérifiez votre email',
    html: `
      <div>
        <h2>Bienvenue !</h2>
        <p>Cliquez sur le lien ci-dessous pour vérifier votre email :</p>
        <a href="${verificationUrl}">Vérifier mon email</a>
        <p>Ce lien expire dans 24 heures.</p>
      </div>
    `
  });
}
```

Mettez à jour `app/api/auth/register/route.ts` :

```typescript
import { sendVerificationEmail } from '@/lib/email';

// Remplacez le console.log par :
await sendVerificationEmail(email, token);
```

### Option 2 : Nodemailer

```bash
npm install nodemailer
npm install --save-dev @types/nodemailer
```

Configuration dans `lib/email.ts` :

```typescript
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransporter({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendVerificationEmail(email: string, token: string) {
  const verificationUrl = `${process.env.NEXTAUTH_URL}/verify-email?token=${token}&email=${encodeURIComponent(email)}`;

  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: email,
    subject: 'Vérifiez votre email',
    html: `
      <div>
        <h2>Bienvenue !</h2>
        <p>Cliquez sur le lien ci-dessous pour vérifier votre email :</p>
        <a href="${verificationUrl}">Vérifier mon email</a>
        <p>Ce lien expire dans 24 heures.</p>
      </div>
    `
  });
}
```

Variables d'environnement :

```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
SMTP_FROM=noreply@yourdomain.com
```

## 🛡️ Sécurité

### Mots de passe

- Hashés avec bcryptjs (12 rounds de salting)
- Minimum 8 caractères requis
- Jamais stockés en clair

### Sessions

- JWT avec expiration automatique
- Token signé avec NEXTAUTH_SECRET
- Protection contre CSRF

### Routes protégées

Le middleware NextAuth protège automatiquement toutes les routes sauf :
- `/login` - Page de connexion
- `/register` - Page d'inscription
- `/verify-email` - Page de vérification

## 🧪 Test du Système

### 1. Tester l'inscription

```bash
# En développement, surveillez les logs pour l'URL de vérification
npm run dev

# Dans les logs, vous verrez :
# URL de vérification: http://localhost:3000/verify-email?token=...
```

### 2. Créer un utilisateur de test

Via SQL Editor de Neon :

```sql
-- Créer un utilisateur avec email déjà vérifié
INSERT INTO users (name, email, password, email_verified)
VALUES (
  'Test User',
  'test@example.com',
  '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyHSrfT.Yqz2', -- password: "password123"
  NOW()
);
```

Connexion :
- Email: `test@example.com`
- Password: `password123`

## 🐛 Dépannage

### "Email et mot de passe requis"
→ Vérifiez que les champs sont bien remplis

### "Aucun utilisateur trouvé avec cet email"
→ L'utilisateur n'existe pas, inscrivez-vous d'abord

### "Veuillez vérifier votre email avant de vous connecter"
→ Cliquez sur le lien de vérification dans l'email (ou logs)

### "Mot de passe incorrect"
→ Vérifiez votre mot de passe

### "Token invalide ou expiré"
→ Demandez un nouveau lien de vérification (ré-inscription)

### Erreur de connexion à la base de données
```bash
# Vérifiez POSTGRES_URL
echo $POSTGRES_URL

# Testez la connexion
psql $POSTGRES_URL -c "SELECT 1"
```

### Les routes ne sont pas protégées
→ Vérifiez que `middleware.ts` est bien configuré

## 📁 Fichiers Créés/Modifiés

### Nouveaux fichiers :
- `lib/password.ts` - Utilitaires pour les mots de passe
- `app/(auth)/register/page.tsx` - Page d'inscription
- `app/(auth)/verify-email/page.tsx` - Page de vérification
- `app/(auth)/layout.tsx` - Layout pour les pages d'auth
- `app/api/auth/register/route.ts` - API d'inscription
- `app/api/auth/verify-email/route.ts` - API de vérification
- `drizzle/0004_create_auth_tables.sql` - Migration DB
- `AUTH_SETUP_GUIDE.md` - Ce fichier

### Fichiers modifiés :
- `lib/auth.ts` - Configuration NextAuth
- `lib/db.ts` - Tables et fonctions auth
- `app/login/page.tsx` - Page de connexion
- `app/(dashboard)/user.tsx` - Composant utilisateur

## 🚀 Déploiement en Production

### 1. Variables d'environnement

Sur Vercel/Netlify, configurez :
```bash
POSTGRES_URL=your_production_db_url
NEXTAUTH_URL=https://yourdomain.com
NEXTAUTH_SECRET=your_production_secret
RESEND_API_KEY=your_resend_key # Si vous utilisez Resend
```

### 2. Appliquer les migrations

```bash
# En production via Neon Console
# Exécutez le script SQL dans l'éditeur SQL
```

### 3. Vérifier la configuration

- [ ] NEXTAUTH_URL pointe vers votre domaine
- [ ] NEXTAUTH_SECRET est défini et sécurisé
- [ ] L'envoi d'emails est configuré
- [ ] Les migrations sont appliquées
- [ ] bcryptjs est installé

## 📚 Ressources

- [NextAuth.js Documentation](https://next-auth.js.org/)
- [Drizzle ORM](https://orm.drizzle.team/)
- [Resend Documentation](https://resend.com/docs)
- [bcrypt.js](https://github.com/dcodeIO/bcrypt.js)

## ✨ Améliorations Futures Possibles

- [ ] "Mot de passe oublié" avec reset par email
- [ ] Authentification à deux facteurs (2FA)
- [ ] OAuth (Google, GitHub, etc.)
- [ ] Gestion des rôles et permissions
- [ ] Historique de connexion
- [ ] Blocage après tentatives échouées
- [ ] Email de bienvenue après vérification
- [ ] Profil utilisateur éditable

---

**Votre système d'authentification est maintenant prêt ! 🎉**

Pour toute question ou problème, consultez ce guide ou les logs de l'application.


















