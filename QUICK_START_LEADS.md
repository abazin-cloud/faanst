# 🚀 Guide de démarrage rapide - Leads Salesforce

## ✅ Problèmes corrigés

### 1. Erreur lors de la création d'un lead
**RÉSOLU** : Plus d'erreur `Cannot read properties of null (reading 'reset')`

### 2. Filtrage des leads par propriétaire
**RÉSOLU** : Affichage uniquement de VOS leads (ceux dont vous êtes propriétaire dans Salesforce)

---

## 🎯 Configuration rapide (2 minutes)

### Étape 1 : Appliquer la migration de base de données

Si vous avez un email Salesforce différent de votre email de connexion, appliquez cette migration :

```bash
cd /Users/a.bazin/Documents/faanst/my-crm-auto

# Rendre le script exécutable
chmod +x scripts/apply-salesforce-email-migration.sh

# Appliquer la migration
POSTGRES_URL="votre_connection_string_neon" ./scripts/apply-salesforce-email-migration.sh
```

⚠️ **Si vous utilisez le même email partout**, cette étape n'est pas nécessaire.

### Étape 2 : Configurer votre email Salesforce (optionnel)

Si votre email de connexion ≠ email Salesforce :

1. Connectez-vous à l'application
2. Allez dans **Paramètres** (menu de gauche)
3. Section **"Intégration Salesforce"**
4. Entrez votre email Salesforce : `antonin.bazin835@agentforce.com`
5. Cliquez sur **"Enregistrer"**

### Étape 3 : Vérifier que ça fonctionne

1. Allez sur la page **Leads**
2. Vous devriez voir :
   - En haut : "Leads de antonin.bazin835@agentforce.com" (ou votre email)
   - Dans le tableau : uniquement VOS 3 leads
3. Créez un nouveau lead :
   - Cliquez sur **"Add Lead"**
   - Remplissez le formulaire
   - Cliquez sur **"Créer le Lead"**
   - ✅ Pas d'erreur !
   - ✅ Le formulaire se réinitialise
   - ✅ Le lead apparaît dans la liste

---

## 📊 Cas d'usage

### Cas 1 : Même email partout (le plus simple)

**Votre situation** :
- Email de connexion : `antonin.bazin835@agentforce.com`
- Email Salesforce : `antonin.bazin835@agentforce.com`

**À faire** :
- ✅ Rien ! Ça fonctionne automatiquement

### Cas 2 : Emails différents

**Votre situation** :
- Email de connexion : `john@example.com`
- Email Salesforce : `antonin.bazin835@agentforce.com`

**À faire** :
1. ✅ Appliquer la migration (Étape 1)
2. ✅ Configurer l'email SF dans les paramètres (Étape 2)
3. ✅ Tester (Étape 3)

---

## 🔍 Vérification rapide

### Comment savoir quel email est utilisé ?

Regardez en haut de la page Leads :
```
Mes Leads Salesforce
Leads de antonin.bazin835@agentforce.com  ← Cet email est utilisé pour filtrer
```

### Comment voir uniquement mes leads ?

C'est automatique ! L'application :
1. Récupère votre email (connexion ou configuré)
2. Trouve votre ID utilisateur dans Salesforce
3. Filtre les leads avec `OwnerId = votre_id`
4. Affiche uniquement vos leads

### Comment actualiser la liste ?

Cliquez sur le bouton **"Actualiser"** (icône de rotation) en haut à droite de la page Leads.

---

## ❌ Dépannage

### Je ne vois aucun lead

**Cause possible** : L'email utilisé ne correspond à aucun utilisateur Salesforce

**Solution** :
1. Vérifiez l'email affiché en haut de la page Leads
2. Vérifiez que cet email existe dans Salesforce :
   - Allez dans Salesforce
   - Setup → Users
   - Recherchez l'email
3. Si l'email n'existe pas, configurez le bon email dans **Paramètres**

### J'ai une erreur "Not authenticated"

**Cause** : Vous n'êtes pas connecté

**Solution** :
1. Reconnectez-vous à l'application
2. Réessayez

### L'erreur "Cannot read properties of null" est toujours là

**Cause** : Le code n'a pas été mis à jour

**Solution** :
1. Vérifiez que vous avez bien tous les fichiers modifiés
2. Redémarrez le serveur de développement :
   ```bash
   cd /Users/a.bazin/Documents/faanst/my-crm-auto
   npm run dev
   # ou
   pnpm dev
   ```

---

## 📚 Documentation complète

Pour plus de détails techniques, consultez [`FIXES_LEADS.md`](./FIXES_LEADS.md)

---

## 🎉 Félicitations !

Vous pouvez maintenant :
- ✅ Créer des leads sans erreur
- ✅ Voir uniquement VOS leads
- ✅ Actualiser la liste à la demande
- ✅ Configurer un email Salesforce personnalisé














