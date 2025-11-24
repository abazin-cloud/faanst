# Corrections des Leads Salesforce

## Problèmes corrigés

### 1. ❌ Erreur lors de la création d'un lead

**Problème** : `TypeError: Cannot read properties of null (reading 'reset')`

**Cause** : Le formulaire était réinitialisé (`e.currentTarget.reset()`) APRÈS la fermeture du dialog. Quand le dialog se ferme, le formulaire est démonté du DOM, rendant `e.currentTarget` null.

**Solution** : Réordonner les opérations pour réinitialiser le formulaire AVANT de fermer le dialog.

**Fichier modifié** : `app/(dashboard)/add-lead-dialog.tsx`

```typescript
// AVANT (❌ ne fonctionne pas)
setOpen(false);
setStatus('Cold');
e.currentTarget.reset(); // ❌ Le formulaire n'existe plus !

// APRÈS (✅ fonctionne)
e.currentTarget.reset(); // ✅ Réinitialiser d'abord
setStatus('Cold');
setOpen(false); // Fermer ensuite
```

### 2. 🔍 Filtrage des leads par propriétaire

**Problème** : L'email du propriétaire était codé en dur dans le code.

**Solution** : Système dynamique de récupération de l'utilisateur connecté.

**Fichiers créés/modifiés** :

1. **Nouvelle API** : `app/api/auth/me/route.ts`
   - Récupère les informations de l'utilisateur connecté
   - Retourne l'email pour le filtrage Salesforce

2. **Page des leads** : `app/(dashboard)/leads/page.tsx`
   - Récupère automatiquement l'email de l'utilisateur
   - Filtre les leads par cet email
   - Ajoute un bouton "Actualiser" pour recharger les leads

## Comment ça fonctionne maintenant

### Flux de données

```
1. L'utilisateur se connecte avec son email
   ↓
2. La page des leads appelle GET /api/auth/me
   ↓
3. L'API retourne l'email de l'utilisateur (ex: antonin.bazin835@agentforce.com)
   ↓
4. La page charge les leads avec GET /api/salesforce/leads?ownerEmail=...
   ↓
5. L'API Salesforce :
   - Récupère l'ID de l'utilisateur Salesforce via son email
   - Filtre les leads avec OwnerId = userId
   ↓
6. L'utilisateur voit uniquement SES leads
```

### Requête Salesforce générée

```sql
-- 1. Trouver l'ID de l'utilisateur
SELECT Id FROM User WHERE Email = 'antonin.bazin835@agentforce.com'

-- 2. Filtrer les leads par OwnerId
SELECT Id, FirstName, LastName, Company, ... 
FROM Lead 
WHERE OwnerId = '<userId>'
ORDER BY CreatedDate DESC 
LIMIT 500
```

## Fonctionnalités ajoutées

### ✅ Bouton "Actualiser"
- Permet de recharger manuellement les leads
- Affiche une animation de chargement
- Désactivé pendant le chargement

### ✅ Affichage de l'email du propriétaire
- En-tête : "Leads de {email}"
- Montre clairement quel utilisateur Salesforce est utilisé

## Important : Mapping des emails

### Si l'email de connexion = email Salesforce
✅ **Ça fonctionne automatiquement !**

Exemple :
- Connexion : `antonin.bazin835@agentforce.com`
- Salesforce : `antonin.bazin835@agentforce.com`
- ✅ Les 3 leads s'affichent

### Si l'email de connexion ≠ email Salesforce
✅ **Solution implémentée !**

Vous pouvez maintenant configurer un email Salesforce différent :

1. Allez dans **Paramètres** (depuis le menu de navigation)
2. Dans la section **"Intégration Salesforce"**
3. Entrez votre email Salesforce dans le champ **"Email Salesforce (optionnel)"**
4. Cliquez sur **"Enregistrer"**
5. Retournez sur la page Leads → vos leads s'affichent ! 🎉

Exemple :
- Connexion : `john@example.com`
- Email Salesforce configuré : `antonin.bazin835@agentforce.com`
- ✅ Les leads de `antonin.bazin835@agentforce.com` s'affichent

## Test de la solution

1. Connectez-vous avec l'email Salesforce : `antonin.bazin835@agentforce.com`
2. Naviguez vers la page "Leads"
3. Vous devriez voir vos 3 leads uniquement
4. Essayez de créer un nouveau lead → pas d'erreur !
5. Le formulaire se réinitialise correctement
6. Le nouveau lead apparaît dans la liste

## Fichiers créés/modifiés

### Corrections principales
```
✅ app/(dashboard)/add-lead-dialog.tsx                    (correction erreur reset)
✅ app/(dashboard)/leads/page.tsx                         (filtrage dynamique)
```

### Nouvelles API
```
✅ app/api/auth/me/route.ts                               (récupération utilisateur)
✅ app/api/auth/update-salesforce-email/route.ts          (mise à jour email SF)
```

### Configuration de l'email Salesforce
```
✅ app/(dashboard)/settings/page.tsx                      (ajout section Salesforce)
✅ app/(dashboard)/settings/salesforce-email-form.tsx     (formulaire de config)
✅ lib/db.ts                                              (ajout champ salesforceEmail)
✅ drizzle/0007_add_salesforce_email.sql                  (migration BDD)
✅ drizzle/meta/_journal.json                             (journal migrations)
✅ scripts/apply-salesforce-email-migration.sh            (script migration)
```

### Documentation
```
✅ FIXES_LEADS.md                                         (cette documentation)
```

## Migration de la base de données

Pour appliquer la migration et ajouter le champ `salesforce_email` :

```bash
# Option 1 : Utiliser le script
chmod +x scripts/apply-salesforce-email-migration.sh
POSTGRES_URL="your_connection_string" ./scripts/apply-salesforce-email-migration.sh

# Option 2 : Appliquer manuellement
psql "$POSTGRES_URL" -f drizzle/0007_add_salesforce_email.sql
```

⚠️ **Note** : Cette migration est optionnelle si tous vos utilisateurs utilisent le même email dans Salesforce et dans l'application.

## Prochaines améliorations possibles

1. ✅ **Configuration de l'email Salesforce** : ~~Permettre de configurer un email Salesforce différent~~ **FAIT !**
2. **Cache des leads** : Éviter de recharger à chaque fois
3. **Pagination** : Si vous avez beaucoup de leads (>500)
4. **Filtres avancés** : Par statut, date, etc.
5. **Synchronisation temps réel** : WebSockets ou polling pour voir les changements en direct
6. **Synchronisation bidirectionnelle** : Mettre à jour Salesforce depuis l'application

