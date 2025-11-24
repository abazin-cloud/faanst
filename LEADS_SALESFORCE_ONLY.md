# ✅ Page Leads - Chargement depuis Salesforce Uniquement

## 🎯 Modifications Effectuées

La page `/leads` charge maintenant **uniquement les leads depuis Salesforce** appartenant à votre utilisateur.

---

## 🔄 Ce Qui a Changé

### 1. **Source de Données**
- ❌ **AVANT** : Leads chargés depuis la base de données PostgreSQL locale
- ✅ **MAINTENANT** : Leads chargés directement depuis Salesforce via API REST

### 2. **Filtrage par Utilisateur**
- Les leads affichés appartiennent uniquement à : `antonin.bazin835@agentforce.com`
- Correspond à votre vue "My Leads" dans Salesforce

### 3. **Bouton de Synchronisation**
- ❌ **RETIRÉ** : Le bouton "Synchroniser avec Salesforce"
- ✅ **AJOUTÉ** : Bouton "Actualiser" pour recharger les leads en temps réel

### 4. **Interface**
- Affiche le nombre exact de leads depuis Salesforce
- Lien direct vers chaque lead dans Salesforce (icône externe)
- Mapping intelligent des statuts Salesforce → Qualification locale

---

## 📊 Mapping des Statuts

### Status Salesforce → Qualification

| Statut Salesforce | Qualification Affichée |
|-------------------|------------------------|
| "Open - Not Contacted" | Nouveau |
| "Working - Contacted" | Qualifié |
| "Qualified" | Transformé |

### Rating Salesforce → Badge Couleur

| Rating | Badge |
|--------|-------|
| Hot | Rouge (destructive) |
| Warm | Bleu (default) |
| Cold | Gris (secondary) |

---

## 🔧 Fichiers Modifiés

### 1. `app/api/salesforce/leads/route.ts`

**Nouveau paramètre ajouté :**
- `ownerEmail` : Filtre les leads par email du propriétaire

**Fonctionnement :**
1. Reçoit l'email de l'utilisateur
2. Récupère l'ID Salesforce du user via SOQL
3. Filtre les leads par `OwnerId`

**Exemple d'utilisation :**
```typescript
GET /api/salesforce/leads?ownerEmail=antonin.bazin835@agentforce.com
```

### 2. `app/(dashboard)/leads/page.tsx`

**Changements majeurs :**
- Transformé en **Client Component** (`'use client'`)
- Utilise `useEffect` pour charger les leads au montage
- Appelle l'API Salesforce avec le filtre `ownerEmail`
- Bouton "Actualiser" pour recharger manuellement
- Liens directs vers Salesforce pour chaque lead

**Constante configurée :**
```typescript
const SALESFORCE_USER_EMAIL = 'antonin.bazin835@agentforce.com';
```

---

## 🚀 Utilisation

### Page Leads

1. **Accédez à la page**
   ```
   http://localhost:3001/leads
   ```

2. **Les leads se chargent automatiquement**
   - Uniquement vos leads (antonin.bazin835@agentforce.com)
   - Chargés en temps réel depuis Salesforce

3. **Actions disponibles**
   - **Actualiser** : Recharge les leads depuis Salesforce
   - **Add Lead** : Crée un nouveau lead (sync auto avec Salesforce)
   - **Voir dans SF** : Ouvre le lead directement dans Salesforce

### Colonnes Affichées

| Colonne | Source Salesforce |
|---------|-------------------|
| Entreprise | `Company` |
| Contact | `FirstName + LastName` |
| Email | `Email` |
| Téléphone | `Phone` |
| Statut SF | `Status` (statut Salesforce brut) |
| Rating | `Rating` (Hot/Warm/Cold) |
| Qualification | Mappé depuis `Status` |

---

## 🔍 Vérifications

### Si vous ne voyez pas vos leads :

#### 1. **Vérifiez l'authentification Salesforce**
```bash
# Testez l'API directement
curl http://localhost:3001/api/salesforce/leads?ownerEmail=antonin.bazin835@agentforce.com
```

#### 2. **Vérifiez dans Salesforce**
- Allez dans Salesforce
- Liste des Leads → "My Leads" (vue personnelle)
- Comptez le nombre de leads
- Ce nombre doit correspondre à ce qui s'affiche dans l'app

#### 3. **Vérifiez la console du navigateur**
```javascript
// Ouvrez la console (F12)
// Vous verrez les requêtes vers /api/salesforce/leads
```

#### 4. **Vérifiez les logs serveur**
```bash
# Dans le terminal où tourne npm run dev
# Vous verrez les requêtes SOQL exécutées
```

---

## 🎯 Comportement en Temps Réel

### Création de Lead

Quand vous créez un nouveau lead via "Add Lead" :

```
1. Lead créé en local (PostgreSQL) ✅
2. Lead automatiquement poussé vers Salesforce ✅
3. Cliquez sur "Actualiser" pour voir le nouveau lead ✅
```

### Modification dans Salesforce

Si vous modifiez un lead directement dans Salesforce :

```
1. Modifiez le lead dans Salesforce
2. Dans l'app, cliquez sur "Actualiser"
3. Les changements apparaissent immédiatement ✅
```

---

## 📝 Structure de la Requête API

### Requête Envoyée

```http
GET /api/salesforce/leads?ownerEmail=antonin.bazin835@agentforce.com&limit=500
```

### SOQL Généré

```sql
-- Étape 1 : Récupérer l'ID du user
SELECT Id FROM User WHERE Email = 'antonin.bazin835@agentforce.com'

-- Étape 2 : Récupérer les leads du user
SELECT 
  Id, FirstName, LastName, Company, Title,
  Email, Phone, MobilePhone,
  Street, City, State, PostalCode, Country,
  LeadSource, Status, Rating, Industry, Website,
  Description, OwnerId,
  CreatedDate, LastModifiedDate
FROM Lead
WHERE OwnerId = '0058d00000XxxxxXXX'
ORDER BY CreatedDate DESC
LIMIT 500
```

### Réponse JSON

```json
{
  "success": true,
  "data": [
    {
      "Id": "00Q...",
      "FirstName": "Douda",
      "LastName": "McFly",
      "Company": "Salesforce",
      "Email": "...",
      "Phone": "...",
      "Status": "Open - Not Contacted",
      "Rating": "Hot",
      "CreatedDate": "2025-01-19T..."
    },
    {
      "Id": "00Q...",
      "FirstName": "test",
      "LastName": "test",
      "Company": "Salesforce",
      "Status": "Open - Not Contacted",
      ...
    }
  ],
  "totalSize": 2,
  "done": true
}
```

---

## 🎨 Interface Utilisateur

### Header
```
Mes Leads Salesforce
Leads de antonin.bazin835@agentforce.com

[Actualiser] [Add Lead]
```

### Stats Cards
```
┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│ Nouveaux  🎯│  │ Qualifiés  →│  │ Transformés→│
│     X       │  │     X       │  │     X       │
│ À qualifier │  │ Qualifiés   │  │ Convertis   │
└─────────────┘  └─────────────┘  └─────────────┘
```

### Tableau avec Onglets
```
[Tous (X)] [Nouveau (X)] [Qualifié (X)] [Transformé (X)]

Entreprise  Contact  Email  Téléphone  Statut SF  Rating  Qualification  Actions
─────────────────────────────────────────────────────────────────────────────────
Salesforce  John Doe john@.. +33...    Open...    Hot     Nouveau        [Voir SF]
```

---

## 🔄 Workflow Complet

### Scénario : Nouveau Lead Créé

```
1. Utilisateur clique sur "Add Lead"
2. Remplit le formulaire
3. Soumet le formulaire
   ↓
4. Lead créé en local (PostgreSQL)
   ↓
5. Lead automatiquement poussé vers Salesforce
   ↓
6. Utilisateur clique sur "Actualiser"
   ↓
7. Le nouveau lead apparaît dans la liste
```

### Scénario : Lead Modifié dans Salesforce

```
1. Ouvrir Salesforce (via lien ou directement)
2. Modifier un lead (changer status, rating, etc.)
3. Sauvegarder dans Salesforce
   ↓
4. Dans l'app, cliquer sur "Actualiser"
   ↓
5. Les modifications apparaissent immédiatement
```

---

## ⚙️ Configuration

### Changer l'Email de l'Utilisateur

Si vous voulez afficher les leads d'un autre utilisateur, modifiez la constante :

```typescript
// app/(dashboard)/leads/page.tsx
const SALESFORCE_USER_EMAIL = 'autre.utilisateur@company.com';
```

### Changer la Limite de Leads

```typescript
// Dans fetchLeads()
const response = await fetch(
  `/api/salesforce/leads?ownerEmail=${...}&limit=1000` // Augmentez ici
);
```

---

## 🐛 Résolution de Problèmes

### Aucun Lead Affiché

**Causes possibles :**

1. **Authentification Salesforce échouée**
   - Vérifiez les credentials dans `.env.local`
   - Testez sur `/dev/salesforce`

2. **Aucun lead dans Salesforce**
   - Vérifiez dans Salesforce → My Leads
   - Créez un lead test

3. **Email incorrect**
   - Vérifiez que `antonin.bazin835@agentforce.com` est correct
   - Vérifiez dans Salesforce → Setup → Users

### Erreur "authentication failure"

- Voir `SALESFORCE_SETUP.md` pour la configuration complète
- Vérifiez le Security Token
- Testez avec la page `/dev/salesforce`

### Leads ne se chargent pas

```javascript
// Ouvrez la console navigateur (F12)
// Regardez l'onglet Network
// Cherchez la requête /api/salesforce/leads
// Vérifiez la réponse
```

---

## 📚 Documentation Liée

- **Configuration Salesforce** : `SALESFORCE_QUICKSTART.md`
- **Setup Complet** : `SALESFORCE_SETUP.md`
- **Synchronisation** : `SALESFORCE_LEAD_SYNC_GUIDE.md`

---

## ✅ Résumé

Maintenant votre page `/leads` :

- ✅ Charge uniquement depuis Salesforce (pas de DB locale)
- ✅ Filtre par votre utilisateur (antonin.bazin835@agentforce.com)
- ✅ Affiche exactement ce que vous voyez dans "My Leads" Salesforce
- ✅ Bouton "Actualiser" pour recharger en temps réel
- ✅ Liens directs vers Salesforce
- ✅ Mapping intelligent des statuts
- ✅ Interface claire et réactive

**C'est prêt à utiliser ! 🚀**














