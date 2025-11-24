# ✅ Synchronisation Bidirectionnelle Salesforce

## 🎯 Objectif

Les leads sont maintenant **synchronisés bidirectionnellement** entre votre application et Salesforce :
- La page `/leads` affiche **uniquement vos leads Salesforce**
- Création de lead via "Add Lead" → **création directe dans Salesforce**
- Rafraîchissement automatique de la liste après création

---

## 🔄 Architecture de Synchronisation

```
┌─────────────────────────────────────────────────────────────┐
│                      VOTRE APPLICATION                      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Page /leads                      AddLeadDialog            │
│  ┌──────────────┐                ┌──────────────┐         │
│  │              │                │              │         │
│  │  Chargement  │◄───────────────│  Création    │         │
│  │  auto des    │   Callback     │  de lead     │         │
│  │  leads SF    │   onLeadAdded  │              │         │
│  │              │                │              │         │
│  └──────┬───────┘                └──────┬───────┘         │
│         │                               │                 │
│         │ GET                           │ POST            │
│         │                               │                 │
└─────────┼───────────────────────────────┼─────────────────┘
          │                               │
          │                               │
      ┌───▼───────────────────────────────▼────┐
      │  API Routes (Server-Side)              │
      │  /api/salesforce/leads                 │
      │                                        │
      │  - GET: Query leads (filtré par owner) │
      │  - POST: Create lead                   │
      └───────────┬──────────────┬─────────────┘
                  │              │
                  │ SOQL Query   │ REST API
                  │              │
          ┌───────▼──────────────▼────────┐
          │     SALESFORCE ORG            │
          │                               │
          │  Leads de:                    │
          │  antonin.bazin835@...         │
          └───────────────────────────────┘
```

---

## 📋 Modifications Effectuées

### 1. **Page Leads** (`app/(dashboard)/leads/page.tsx`)

#### Avant
```typescript
// Chargeait depuis la DB PostgreSQL locale
// Avait un bouton "Actualiser" manuel
```

#### Après
```typescript
// Charge uniquement depuis Salesforce
// Filtre par propriétaire (antonin.bazin835@agentforce.com)
// Pas de bouton actualiser
// Callback automatique après création de lead
```

**Changements clés :**
- ❌ Suppression du bouton "Actualiser"
- ✅ Ajout du callback `onLeadAdded` au dialog
- ✅ Fonction `fetchLeads` passée au dialog
- ✅ Chargement automatique au montage

---

### 2. **Dialog Add Lead** (`app/(dashboard)/add-lead-dialog.tsx`)

#### Avant
```typescript
// Utilisait une Server Action (addLead)
// Créait le lead en local, puis sync async vers SF
// Pas de feedback immédiat
```

#### Après
```typescript
// Appelle directement l'API POST /api/salesforce/leads
// Création directe dans Salesforce (pas de DB locale)
// Rafraîchit la liste via callback après succès
// Affiche les erreurs si échec
```

**Changements clés :**
- ❌ Suppression du champ "Estimated Value" (n'existe pas dans SF)
- ✅ Ajout de la prop `onLeadAdded?: () => void`
- ✅ Utilisation de `fetch()` pour appeler l'API Salesforce
- ✅ Mapping automatique des données (LastName, FirstName, etc.)
- ✅ Gestion d'erreur avec affichage utilisateur
- ✅ Réinitialisation du formulaire après succès

**Mapping des Champs :**

| Champ Formulaire | Champ Salesforce | Notes |
|------------------|------------------|-------|
| Company Name | `Company` | Requis |
| Contact Name | `FirstName` + `LastName` | Splité automatiquement |
| Email | `Email` | - |
| Phone | `Phone` | Optionnel |
| Rating | `Rating` | Hot/Warm/Cold |
| Notes | `Description` | Optionnel |
| - | `Status` | Fixé à "Open - Not Contacted" |

---

### 3. **Dashboard** (`app/(dashboard)/page.tsx`)

**Changement :**
- ✅ Ajout du callback `onLeadAdded={fetchData}` au dialog
- Permet de rafraîchir les leads affichés sur le dashboard

---

### 4. **API Salesforce Leads** (`app/api/salesforce/leads/route.ts`)

**Déjà modifié précédemment :**
- ✅ Support du paramètre `ownerEmail`
- ✅ Filtrage par `OwnerId` dans Salesforce

---

## 🚀 Workflow Complet

### Scénario : Créer un Nouveau Lead

```
1. Utilisateur sur /leads
   ↓
2. Clique sur "Add Lead"
   ↓
3. Remplit le formulaire
   - Company Name: "Tesla"
   - Contact Name: "Elon Musk"
   - Email: "elon@tesla.com"
   - Rating: "Hot"
   ↓
4. Clique sur "Créer le Lead"
   ↓
5. Dialog envoie POST /api/salesforce/leads
   {
     "Company": "Tesla",
     "FirstName": "Elon",
     "LastName": "Musk",
     "Email": "elon@tesla.com",
     "Rating": "Hot",
     "Status": "Open - Not Contacted"
   }
   ↓
6. API crée le lead dans Salesforce
   ↓
7. Salesforce renvoie l'ID du lead créé
   ↓
8. Dialog se ferme
   ↓
9. Callback onLeadAdded() est appelé
   ↓
10. Page /leads recharge les leads depuis Salesforce
   ↓
11. ✅ Le nouveau lead apparaît dans la liste !
```

---

## 📝 Code Clé

### Dialog : Création du Lead

```typescript
// app/(dashboard)/add-lead-dialog.tsx

async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
  e.preventDefault();
  setIsSubmitting(true);
  
  const formData = new FormData(e.currentTarget);
  
  // Extraire et mapper les données
  const contactName = formData.get('contactName') as string;
  const nameParts = contactName.trim().split(' ');
  const lastName = nameParts.pop() || contactName;
  const firstName = nameParts.join(' ') || undefined;

  const leadData = {
    LastName: lastName,
    FirstName: firstName,
    Company: formData.get('companyName') as string,
    Email: formData.get('email') as string,
    Phone: formData.get('phone') as string || undefined,
    Status: 'Open - Not Contacted',
    Rating: status, // Hot, Warm, ou Cold
    Description: formData.get('notes') as string || undefined,
  };

  // Appel API Salesforce
  const response = await fetch('/api/salesforce/leads', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(leadData),
  });

  const result = await response.json();

  if (!result.success) {
    throw new Error(result.error);
  }

  // Fermer et rafraîchir
  setOpen(false);
  if (onLeadAdded) {
    onLeadAdded(); // ← Callback pour recharger la liste
  }
}
```

### Page Leads : Chargement et Callback

```typescript
// app/(dashboard)/leads/page.tsx

const SALESFORCE_USER_EMAIL = 'antonin.bazin835@agentforce.com';

export default function LeadsPage() {
  const [allLeads, setAllLeads] = useState<SalesforceLead[]>([]);
  const [loading, setLoading] = useState(true);

  // Fonction de chargement des leads
  const fetchLeads = async () => {
    setLoading(true);
    const response = await fetch(
      `/api/salesforce/leads?ownerEmail=${SALESFORCE_USER_EMAIL}&limit=500`
    );
    const data = await response.json();
    setAllLeads(data.data || []);
    setLoading(false);
  };

  // Chargement initial
  useEffect(() => {
    fetchLeads();
  }, []);

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1>Mes Leads Salesforce</h1>
        <AddLeadDialog onLeadAdded={fetchLeads} /> {/* ← Callback */}
      </div>
      
      {/* Liste des leads */}
      {renderLeadsTable(allLeads)}
    </div>
  );
}
```

---

## 🎯 Propriétaire des Leads

### Configuration

Le propriétaire des leads est défini dans la page :

```typescript
// app/(dashboard)/leads/page.tsx
const SALESFORCE_USER_EMAIL = 'antonin.bazin835@agentforce.com';
```

### Comment ça marche ?

1. **Lors du chargement de la page** :
   ```
   GET /api/salesforce/leads?ownerEmail=antonin.bazin835@agentforce.com
   ```

2. **L'API exécute** :
   ```sql
   -- Récupère l'ID du user
   SELECT Id FROM User WHERE Email = 'antonin.bazin835@agentforce.com'
   
   -- Résultat: '0058d00000XxxxxXXX'
   
   -- Récupère les leads du user
   SELECT Id, FirstName, LastName, ...
   FROM Lead
   WHERE OwnerId = '0058d00000XxxxxXXX'
   ORDER BY CreatedDate DESC
   ```

3. **Seuls les leads de ce propriétaire sont retournés**

### Créer un Lead pour un Autre Propriétaire

Si vous voulez créer un lead pour un autre propriétaire, vous devez modifier l'API POST pour spécifier `OwnerId` :

```typescript
// Dans le dialog, ajouter :
const leadData = {
  // ... autres champs
  OwnerId: 'ID_DU_PROPRIETAIRE', // ID Salesforce du user
};
```

**Note :** Par défaut, Salesforce assigne le lead au user qui fait la requête API (celui qui est authentifié dans SF_USERNAME).

---

## ✅ Avantages de Cette Architecture

### 1. **Synchronisation en Temps Réel**
- Pas de délai entre création et affichage
- Pas de jobs de synchronisation en arrière-plan
- Pas de données dupliquées en local

### 2. **Source de Vérité Unique**
- Salesforce est la seule source de données
- Pas de problèmes de désynchronisation
- Garantit la cohérence des données

### 3. **Expérience Utilisateur Fluide**
- Création → Affichage immédiat
- Pas besoin de cliquer sur "Actualiser"
- Feedback d'erreur en cas d'échec

### 4. **Sécurité**
- Filtre par propriétaire (chaque user ne voit que ses leads)
- Toutes les opérations passent par l'API server-side
- Pas d'accès direct à Salesforce depuis le client

---

## 🐛 Gestion des Erreurs

### Erreur lors de la Création

Si la création échoue dans Salesforce, le dialog affiche l'erreur :

```typescript
{error && (
  <div className="p-3 bg-red-50 border border-red-200 rounded-md">
    <p className="text-sm text-red-600">{error}</p>
  </div>
)}
```

**Erreurs possibles :**
- Authentification Salesforce échouée
- Champs requis manquants
- Validation Salesforce (email invalide, etc.)
- Limites API dépassées

### Erreur lors du Chargement

Si le chargement des leads échoue :

```typescript
if (error) {
  return (
    <div className="text-center py-12">
      <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
        <p className="text-sm text-red-600">
          <strong>Erreur:</strong> {error}
        </p>
      </div>
    </div>
  );
}
```

---

## 🔍 Debug et Logs

### Côté Client (Console Navigateur)

```javascript
// Dans add-lead-dialog.tsx
console.log('Creating lead in Salesforce:', leadData);
console.log('Lead created successfully:', result.data);

// Dans leads/page.tsx
console.error('Error fetching leads:', error);
```

### Côté Serveur (Terminal)

```bash
# Logs API Salesforce
[POST] /api/salesforce/leads
Creating lead: { Company: 'Tesla', LastName: 'Musk', ... }
Lead created with ID: 00Q8d00000XxxxxXXX

[GET] /api/salesforce/leads?ownerEmail=antonin.bazin835@agentforce.com
Fetching leads for owner: 0058d00000XxxxxXXX
Found 3 leads
```

---

## 🧪 Testing

### Test 1 : Afficher Vos Leads

1. Allez sur `http://localhost:3001/leads`
2. Vous devez voir exactement 2 leads (comme dans Salesforce)
3. "Douda McFly" et "test test"

### Test 2 : Créer un Nouveau Lead

1. Cliquez sur "Add Lead"
2. Remplissez le formulaire :
   - Company: "Test Company"
   - Contact: "John Doe"
   - Email: "john@test.com"
   - Rating: "Hot"
3. Cliquez sur "Créer le Lead"
4. Le dialog se ferme
5. Le lead apparaît immédiatement dans la liste

### Test 3 : Vérifier dans Salesforce

1. Ouvrez Salesforce
2. Allez dans Leads → "My Leads"
3. Vous devez voir le lead créé depuis l'app
4. Vérifiez que tous les champs sont corrects

### Test 4 : Modifier dans Salesforce

1. Dans Salesforce, modifiez un lead (changez le status)
2. Dans l'app, rechargez la page `/leads` (F5)
3. Les modifications doivent apparaître

---

## ⚙️ Configuration

### Changer l'Email du Propriétaire

Si vous voulez afficher les leads d'un autre utilisateur :

```typescript
// app/(dashboard)/leads/page.tsx
const SALESFORCE_USER_EMAIL = 'autre.user@company.com';
```

### Changer le Status par Défaut

Pour créer les leads avec un autre status par défaut :

```typescript
// app/(dashboard)/add-lead-dialog.tsx
const leadData = {
  // ...
  Status: 'Working - Contacted', // Au lieu de 'Open - Not Contacted'
};
```

### Ajouter des Champs Personnalisés

Si vous avez des champs personnalisés dans Salesforce :

```typescript
// app/(dashboard)/add-lead-dialog.tsx
const leadData = {
  // ... champs standards
  CustomField__c: 'valeur', // Champ personnalisé
};
```

---

## 📊 Résumé des Flux de Données

### Flux de Lecture (GET)

```
Page /leads
    │
    ├─► GET /api/salesforce/leads?ownerEmail=...
    │       │
    │       ├─► Query Salesforce User ID
    │       │
    │       ├─► Query Salesforce Leads (WHERE OwnerId = ...)
    │       │
    │       └─► Return leads to client
    │
    └─► Display leads in table
```

### Flux d'Écriture (POST)

```
AddLeadDialog
    │
    ├─► User fills form
    │
    ├─► POST /api/salesforce/leads
    │       │
    │       ├─► Create lead in Salesforce
    │       │
    │       └─► Return created lead ID
    │
    ├─► Close dialog
    │
    └─► Call onLeadAdded()
            │
            └─► Page refetches leads
                    │
                    └─► New lead appears in list ✅
```

---

## 🎨 Interface Utilisateur

### Page Leads - Header

```
┌─────────────────────────────────────────────────────────┐
│  Mes Leads Salesforce                    [Add Lead]     │
│  Leads de antonin.bazin835@agentforce.com               │
└─────────────────────────────────────────────────────────┘
```

### Dialog - Création de Lead

```
┌───────────────────────────────────────────────┐
│  Add New Lead                            [X]  │
│  Le lead sera créé directement dans SF       │
├───────────────────────────────────────────────┤
│                                               │
│  Company Name *        [__________________]   │
│  Contact Name *        [__________________]   │
│  Email *               [__________________]   │
│  Phone                 [__________________]   │
│  Rating *              [Cold ▼]               │
│  Notes                 [__________________]   │
│                        [__________________]   │
│                                               │
│               [Cancel]  [Créer le Lead]       │
└───────────────────────────────────────────────┘
```

### Formulaire Soumis

```
┌───────────────────────────────────────────────┐
│  Add New Lead                            [X]  │
│  Le lead sera créé directement dans SF       │
├───────────────────────────────────────────────┤
│                                               │
│  [Loading spinner]                            │
│  Création dans Salesforce...                  │
│                                               │
└───────────────────────────────────────────────┘
```

---

## 🔗 Fichiers Modifiés

| Fichier | Modifications |
|---------|---------------|
| `app/(dashboard)/leads/page.tsx` | - Suppression bouton "Actualiser"<br>- Ajout callback au dialog |
| `app/(dashboard)/add-lead-dialog.tsx` | - Création directe dans Salesforce<br>- Suppression champ "Estimated Value"<br>- Ajout gestion d'erreurs<br>- Ajout callback onLeadAdded |
| `app/(dashboard)/page.tsx` | - Ajout callback au dialog |

---

## 📚 Documentation Liée

- **Configuration Salesforce** : `SALESFORCE_QUICKSTART.md`
- **Affichage Leads Only** : `LEADS_SALESFORCE_ONLY.md`
- **API Salesforce** : `SALESFORCE_INTEGRATION_SUMMARY.md`

---

## ✅ C'est Prêt !

Votre application est maintenant configurée pour :

- ✅ Afficher uniquement les leads Salesforce de votre propriétaire
- ✅ Créer des leads directement dans Salesforce
- ✅ Rafraîchir automatiquement la liste après création
- ✅ Synchronisation bidirectionnelle en temps réel
- ✅ Pas de bouton "Actualiser" manuel nécessaire

**Testez maintenant en créant un nouveau lead ! 🚀**














