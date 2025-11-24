# 🔄 Guide de Synchronisation des Leads avec Salesforce

## Vue d'ensemble

Votre application CRM est maintenant **synchronisée bidirectionnellement** avec Salesforce. Les leads créés dans votre app sont automatiquement poussés vers Salesforce, et vous pouvez importer les leads Salesforce dans votre app.

---

## ✨ Fonctionnalités

### Synchronisation Automatique
- ✅ **Création automatique** : Chaque nouveau lead créé dans l'app est automatiquement envoyé à Salesforce
- ✅ **Mapping intelligent** : Les champs sont automatiquement mappés entre les deux systèmes
- ✅ **Tracking** : Chaque lead local conserve son ID Salesforce pour éviter les doublons

### Synchronisation Manuelle
- 🔄 **Bidirectionnelle** : Synchronise dans les deux sens (recommandé)
- ⬇️ **Import** : Récupère les leads depuis Salesforce (90 derniers jours)
- ⬆️ **Export** : Envoie tous les leads locaux vers Salesforce

---

## 📊 Mapping des Champs

### De l'App Local vers Salesforce

| Champ Local | Champ Salesforce | Notes |
|-------------|------------------|-------|
| `contactName` | `FirstName` + `LastName` | Séparé automatiquement |
| `companyName` | `Company` | Obligatoire |
| `email` | `Email` | |
| `phone` | `Phone` | |
| `estimatedValue` | `AnnualRevenue` | Valeur numérique |
| `status` (hot/warm/cold) | `Rating` | Hot/Warm/Cold |
| `qualificationStatus` | `Status` | Voir tableau ci-dessous |
| `notes` | `Description` | |

### Mapping des Statuts de Qualification

| Status Local | Status Salesforce |
|--------------|-------------------|
| `nouveau` | Open - Not Contacted |
| `qualifie` | Working - Contacted |
| `transforme` | Qualified |

---

## 🚀 Utilisation

### 1. Créer un Lead (Synchronisation Automatique)

1. Dans votre app, allez sur **Gestion des Leads**
2. Cliquez sur **Add Lead**
3. Remplissez le formulaire
4. Cliquez sur **Add Lead**

✅ **Le lead est automatiquement créé dans Salesforce !**

### 2. Synchroniser Manuellement

Dans la page **Gestion des Leads**, cliquez sur le bouton **Synchroniser avec Salesforce**

#### Options disponibles :

**🔄 Synchronisation complète (recommandée)**
- Importe les nouveaux leads depuis Salesforce
- Met à jour les leads existants
- Pousse les leads locaux non synchronisés
- **Utilisez cette option régulièrement (1x par jour)**

**⬇️ Importer depuis Salesforce**
- Récupère uniquement les leads Salesforce (90 derniers jours)
- Crée de nouveaux leads locaux
- Met à jour les leads existants

**⬆️ Envoyer vers Salesforce**
- Envoie tous les leads locaux vers Salesforce
- Crée ou met à jour selon le cas

---

## 🔧 Configuration Technique

### Base de Données

Deux nouveaux champs ont été ajoutés à la table `leads` :

```sql
salesforce_id TEXT        -- ID du lead dans Salesforce
last_synced_at TIMESTAMP  -- Date de dernière synchronisation
```

### Fichiers Créés/Modifiés

**Nouveaux fichiers :**
1. `lib/salesforce-lead-sync.ts` - Fonctions de synchronisation
2. `app/api/sync/leads/route.ts` - API de synchronisation
3. `app/(dashboard)/leads/sync-button.tsx` - Bouton de synchronisation
4. `drizzle/0006_add_salesforce_id_to_leads.sql` - Migration SQL

**Fichiers modifiés :**
1. `lib/db.ts` - Ajout des champs `salesforceId` et `lastSyncedAt`
2. `app/(dashboard)/actions.ts` - Synchronisation auto lors de création
3. `app/(dashboard)/leads/page.tsx` - Ajout du bouton de synchronisation

---

## 🔐 Sécurité

- ✅ Toute la synchronisation se fait **côté serveur**
- ✅ Aucune credentials Salesforce exposée au client
- ✅ Les erreurs de synchronisation ne bloquent pas la création locale
- ✅ Logs détaillés pour le debugging

---

## 📡 API Endpoints

### GET /api/sync/leads

Synchronise les leads selon la direction spécifiée.

**Query Parameters :**
- `direction` : `pull` | `push` | `both` (défaut: `both`)

**Exemples :**

```bash
# Synchronisation complète
GET /api/sync/leads?direction=both

# Importer depuis Salesforce uniquement
GET /api/sync/leads?direction=pull

# Envoyer vers Salesforce uniquement
GET /api/sync/leads?direction=push
```

**Réponse :**

```json
{
  "success": true,
  "direction": "both",
  "result": {
    "pulled": {
      "created": 5,
      "updated": 12,
      "total": 17
    },
    "pushed": {
      "synced": 8,
      "errors": []
    }
  },
  "message": "Synchronisation bidirectionnelle réussie : 5 créés, 12 mis à jour, 8 poussés"
}
```

### POST /api/sync/leads

Synchronisation bidirectionnelle complète (même chose que GET avec `direction=both`).

---

## 🛠️ Fonctions Utiles

### Dans le Code

```typescript
import {
  pushLeadToSalesforce,
  pullLeadsFromSalesforce,
  syncLeadsBidirectional,
  convertLocalLeadToSalesforce,
  convertSalesforceLeadToLocal
} from '@/lib/salesforce-lead-sync';

// Pousser un lead spécifique vers Salesforce
const salesforceId = await pushLeadToSalesforce(lead);

// Importer tous les leads Salesforce
const result = await pullLeadsFromSalesforce();
console.log(`${result.created} créés, ${result.updated} mis à jour`);

// Synchronisation bidirectionnelle
const fullSync = await syncLeadsBidirectional();
```

---

## 🔄 Workflow Typique

### Scénario 1 : Nouveau Prospect au Salon

1. Commercial crée un lead dans l'app (Mode Salon)
2. ✅ Lead créé en local
3. ✅ Lead automatiquement poussé vers Salesforce
4. L'équipe commerciale voit le lead dans Salesforce immédiatement

### Scénario 2 : Lead Créé dans Salesforce

1. Un lead est créé dans Salesforce (via form web, import, etc.)
2. Dans l'app, cliquez sur **Synchroniser** → **Importer depuis Salesforce**
3. ✅ Le lead apparaît dans votre app

### Scénario 3 : Mise à Jour Bidirectionnelle

1. Un lead est modifié dans Salesforce
2. Dans l'app, lancez une **Synchronisation complète**
3. ✅ Le lead local est mis à jour
4. ✅ Les leads locaux non synchronisés sont poussés vers Salesforce

---

## 📋 Migration de la Base de Données

Pour appliquer la migration qui ajoute les champs de synchronisation :

```bash
# Option 1 : Avec Drizzle
npm run db:push

# Option 2 : Script SQL manuel
psql $DATABASE_URL < drizzle/0006_add_salesforce_id_to_leads.sql
```

**⚠️ Important :** Faites cette migration **avant** d'utiliser la synchronisation !

---

## 🐛 Résolution de Problèmes

### Erreur : "Lead was created locally but not in Salesforce"

**Cause :** Problème de connexion Salesforce ou credentials invalides

**Solution :**
1. Vérifiez vos variables d'environnement Salesforce
2. Testez la connexion sur `/dev/salesforce`
3. Relancez une synchronisation manuelle

### Les Leads n'Apparaissent Pas

**Vérifiez :**
- [ ] Les credentials Salesforce sont corrects
- [ ] La migration SQL a été appliquée
- [ ] Les leads ont été créés dans les 90 derniers jours (filtre de l'API)

### Doublons

**Cause :** Le champ `salesforceId` n'est pas rempli

**Solution :**
1. Supprimez les doublons dans Salesforce
2. Relancez une synchronisation complète
3. Les leads seront correctement mappés

---

## 🎯 Bonnes Pratiques

### ✅ À Faire

- Synchronisez **régulièrement** (1x par jour minimum)
- Utilisez la **synchronisation complète** pour éviter les désynchronisations
- Vérifiez les logs en cas d'erreur
- Testez d'abord sur un **environnement sandbox** Salesforce

### ❌ À Éviter

- Ne pas synchroniser pendant plusieurs jours
- Ne pas ignorer les erreurs de synchronisation
- Ne pas modifier manuellement les IDs Salesforce dans la base de données

---

## 📈 Métriques de Synchronisation

La synchronisation retourne des métriques utiles :

```typescript
{
  pulled: {
    created: 5,    // Nouveaux leads importés de Salesforce
    updated: 12,   // Leads existants mis à jour
    total: 17      // Total de leads traités
  },
  pushed: {
    synced: 8,     // Leads locaux envoyés à Salesforce
    errors: []     // Erreurs éventuelles
  }
}
```

---

## 🚦 État de Synchronisation

Pour chaque lead, vous pouvez voir l'état de synchronisation :

```typescript
// Dans votre code
if (lead.salesforceId) {
  console.log('Lead synchronisé avec Salesforce:', lead.salesforceId);
  console.log('Dernière sync:', lead.lastSyncedAt);
} else {
  console.log('Lead non synchronisé - sync pending');
}
```

---

## 🎉 Résumé

Votre CRM est maintenant **complètement intégré** avec Salesforce :

- ✅ Synchronisation automatique à la création
- ✅ Synchronisation manuelle à la demande
- ✅ Mapping intelligent des champs
- ✅ Tracking des synchronisations
- ✅ Gestion des erreurs gracieuse
- ✅ Interface utilisateur intuitive

**Prochaines étapes :**
1. Appliquez la migration SQL
2. Testez la synchronisation
3. Formez votre équipe
4. Profitez de la synchronisation automatique ! 🚀














