# 🚀 Configuration Variables d'Environnement Vercel

## ⚠️ ERREUR ACTUELLE
```
MissingSecret: Please define a `secret`
```

NextAuth.js v5 nécessite la variable `AUTH_SECRET` définie sur Vercel.

---

## 📝 Variables d'Environnement Requises

### 1. AUTH_SECRET (CRITIQUE)

**Pour Production:**
```bash
AUTH_SECRET=TwKrMaStcR5LLOa2bB5Gb3WiUze6glmEbZYwcvUYpBo=
```

### 2. POSTGRES_URL (Database)

```bash
POSTGRES_URL=postgresql://neondb_owner:npg_iT4UZth3Kasz@ep-little-truth-agzgczg1-pooler.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
```

### 3. AUTH_URL (Optionnel mais recommandé)

Pour Production:
```bash
AUTH_URL=https://votre-app.vercel.app
```

Pour Preview:
```bash
AUTH_URL=https://your-preview-url.vercel.app
```

---

## 🔧 Comment Ajouter sur Vercel

### Via Interface Web (Recommandé)

1. **Allez sur Vercel Dashboard**
   - https://vercel.com/dashboard

2. **Sélectionnez votre projet**

3. **Settings → Environment Variables**

4. **Ajoutez chaque variable:**

   | Nom | Value | Environnements |
   |-----|-------|---------------|
   | `AUTH_SECRET` | `TwKrMaStcR5LLOa2bB5Gb3WiUze6glmEbZYwcvUYpBo=` | ✅ Production, ✅ Preview, ✅ Development |
   | `POSTGRES_URL` | `postgresql://neondb_owner:...` | ✅ Production, ✅ Preview, ✅ Development |
   | `AUTH_URL` | `https://votre-app.vercel.app` | ✅ Production uniquement |

5. **Cliquez sur "Save"**

6. **Redéployez:**
   - Settings → Deployments → Dernière version → "..." → Redeploy

---

## 📋 Via CLI Vercel

```bash
# Se connecter à Vercel
vercel login

# Aller dans le projet
cd /Users/a.bazin/Documents/faanst/my-crm-auto

# Lier le projet (si pas déjà fait)
vercel link

# Ajouter AUTH_SECRET pour tous les environnements
vercel env add AUTH_SECRET
# Quand demandé, saisissez: TwKrMaStcR5LLOa2bB5Gb3WiUze6glmEbZYwcvUYpBo=
# Sélectionnez: Production, Preview, Development (tous)

# Ajouter POSTGRES_URL
vercel env add POSTGRES_URL
# Saisissez votre URL de base de données
# Sélectionnez: Production, Preview, Development (tous)

# Ajouter AUTH_URL (optionnel)
vercel env add AUTH_URL production
# Saisissez: https://votre-app.vercel.app

# Redéployer
vercel --prod
```

---

## ✅ Vérifier que les Variables sont Définies

### 1. Via Interface Vercel
- Settings → Environment Variables
- Vous devriez voir `AUTH_SECRET`, `POSTGRES_URL`, etc.

### 2. Via CLI
```bash
vercel env ls
```

### 3. Vérifier après Redéploiement
- Allez sur votre app en production
- Ouvrez `/login`
- L'erreur "MissingSecret" ne devrait plus apparaître

---

## 🐛 Si l'Erreur Persiste

### 1. Vérifiez que vous avez bien redéployé
Après avoir ajouté les variables, un redéploiement est **obligatoire**.

### 2. Vérifiez les logs Vercel
```bash
vercel logs
```

Ou sur le dashboard: Deployments → [Votre déploiement] → Logs

### 3. Vérifiez le nom de la variable
- ✅ Correct: `AUTH_SECRET`
- ❌ Incorrect: `NEXTAUTH_SECRET` (ancien format NextAuth v4)

---

## 📚 Documentation NextAuth.js v5

NextAuth.js v5 utilise:
- `AUTH_SECRET` au lieu de `NEXTAUTH_SECRET`
- `AUTH_URL` au lieu de `NEXTAUTH_URL`

Pour plus d'infos: https://authjs.dev/getting-started/deployment

---

## 🔒 Sécurité

⚠️ **NE JAMAIS** commiter les secrets dans Git
- Les secrets doivent être uniquement dans Vercel Environment Variables
- Ajoutez `.env.local` dans `.gitignore`


