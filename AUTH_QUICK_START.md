# Démarrage Rapide - Authentification

## 🚀 3 Étapes Pour Démarrer

### 1. Installer bcryptjs (2 min)

```bash
cd my-crm-auto
npm install bcryptjs @types/bcryptjs
```

### 2. Appliquer la migration DB (2 min)

**Méthode simple via Neon Console:**

1. Allez sur https://console.neon.tech/
2. Sélectionnez votre projet
3. Cliquez sur "SQL Editor"
4. Copiez-collez le contenu de `drizzle/0004_create_auth_tables.sql`
5. Cliquez sur "Run"

### 3. Configurer les variables (1 min)

Ajoutez dans `.env.local` :

```bash
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=$(openssl rand -base64 32)
```

**OU générez un secret avec Node:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

## ✅ C'est prêt !

```bash
npm run dev
```

## 🧪 Tester

1. **S'inscrire** : http://localhost:3000/register
2. **Vérifier l'email** : Copiez l'URL depuis les logs du terminal
3. **Se connecter** : http://localhost:3000/login

## 📋 URLs de l'Application

| Page | URL | Description |
|------|-----|-------------|
| Inscription | `/register` | Créer un compte |
| Connexion | `/login` | Se connecter |
| Vérification | `/verify-email?token=xxx&email=xxx` | Vérifier l'email |
| Dashboard | `/` | Page d'accueil (protégée) |
| Configurateur | `/configurateur` | Configurer un véhicule (protégé) |

## 🔐 Routes Protégées

**Automatiquement** : Toutes les routes SAUF `/login`, `/register`, `/verify-email`

Si vous n'êtes pas connecté → Redirection vers `/login`

## 💡 Astuce - Créer un utilisateur de test

Dans Neon SQL Editor :

```sql
INSERT INTO users (name, email, password, email_verified)
VALUES (
  'Admin Test',
  'admin@test.fr',
  '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyHSrfT.Yqz2',
  NOW()
);
```

**Connexion:**
- Email: `admin@test.fr`
- Password: `password123`

## 📧 Envoi d'Emails (Production)

Pour l'envoi réel d'emails, installez Resend :

```bash
npm install resend
```

Ajoutez dans `.env.local` :
```bash
RESEND_API_KEY=your_key_here
```

Voir `AUTH_SETUP_GUIDE.md` pour la configuration complète.

## 🐛 Problème ?

### Les packages ne s'installent pas
```bash
# Essayez avec pnpm
pnpm add bcryptjs @types/bcryptjs
```

### La migration échoue
→ Vérifiez `POSTGRES_URL` dans `.env.local`

### "Cannot find module 'bcryptjs'"
```bash
# Réinstallez
npm install bcryptjs --force
```

### Impossible de se connecter
→ Vérifiez que l'email est vérifié (`email_verified` non null dans la DB)

## 📚 Documentation Complète

Consultez `AUTH_SETUP_GUIDE.md` pour :
- Configuration détaillée
- Envoi d'emails
- Sécurité
- Déploiement en production
- Dépannage avancé

---

**Tout est configuré ! Vous pouvez maintenant vous connecter à votre CRM. 🎉**


















