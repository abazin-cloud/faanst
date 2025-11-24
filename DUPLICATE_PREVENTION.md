# 🛡️ Prévention des doublons de leads

## ✅ Fonctionnalité implémentée

Le système empêche maintenant la création de leads en doublon dans Salesforce en vérifiant :
- ✅ **Email** : Aucun lead avec le même email ne peut être créé
- ✅ **Téléphone** : Aucun lead avec le même numéro de téléphone ne peut être créé

---

## 🔍 Comment ça fonctionne ?

### 1. Vérification AVANT la création

Avant de créer un lead dans Salesforce, le système :

1. **Vérifie l'email** (si fourni) :
   ```sql
   SELECT Id, FirstName, LastName, Company, Email, Phone, Status 
   FROM Lead 
   WHERE Email = 'email@example.com'
   ```

2. **Vérifie le téléphone** (si fourni) :
   ```sql
   SELECT Id, FirstName, LastName, Company, Email, Phone, Status 
   FROM Lead 
   WHERE Phone = '+33662477693'
   ```

3. **Si un doublon est détecté** :
   - ❌ La création est bloquée
   - 🔔 Un message d'erreur clair s'affiche
   - 📋 Les détails du lead existant sont affichés
   - 🔗 Un lien direct vers Salesforce est fourni

4. **Si aucun doublon n'existe** :
   - ✅ Le lead est créé normalement

### 2. Affichage détaillé de l'erreur

Quand un doublon est détecté, l'utilisateur voit :

```
┌─────────────────────────────────────────────┐
│ ❌ Un lead avec cet email existe déjà       │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│ 📋 Lead existant trouvé :                   │
│                                              │
│ Nom : John Doe                              │
│ Entreprise : Acme Corp                      │
│ Email : john@acme.com                       │
│ Téléphone : +33662477693                    │
│ Statut : Open - Not Contacted               │
│                                              │
│ 🔗 Voir dans Salesforce →                   │
└─────────────────────────────────────────────┘
```

---

## 🎯 Scénarios d'utilisation

### Scénario 1 : Email en doublon

**Action** : Créer un lead avec `antonin.bazin@gmail.com`

**Résultat** :
- ❌ Création bloquée
- 💬 Message : "Un lead avec cet email existe déjà"
- 📋 Affichage du lead existant
- 🔗 Lien vers Salesforce pour voir le lead

### Scénario 2 : Téléphone en doublon

**Action** : Créer un lead avec `+33662477693`

**Résultat** :
- ❌ Création bloquée
- 💬 Message : "Un lead avec ce numéro de téléphone existe déjà"
- 📋 Affichage du lead existant
- 🔗 Lien vers Salesforce

### Scénario 3 : Aucun doublon

**Action** : Créer un lead avec des données uniques

**Résultat** :
- ✅ Lead créé avec succès
- 🔄 Liste des leads rafraîchie
- 📝 Formulaire réinitialisé

---

## 🔧 Configuration technique

### API Route : `/api/salesforce/leads` (POST)

**Vérifications effectuées** :
1. Validation des champs requis (`LastName`, `Company`)
2. Vérification des doublons par email
3. Vérification des doublons par téléphone
4. Création du lead si aucun doublon

**Codes HTTP retournés** :
- `201 Created` : Lead créé avec succès
- `400 Bad Request` : Champs requis manquants
- `409 Conflict` : Doublon détecté
- `500 Internal Server Error` : Erreur serveur

**Structure de la réponse en cas de doublon** :
```json
{
  "success": false,
  "error": "Un lead avec cet email existe déjà",
  "duplicate": {
    "id": "00QgL000007bgPFUAY",
    "name": "John Doe",
    "company": "Acme Corp",
    "email": "john@acme.com",
    "phone": "+33662477693",
    "status": "Open - Not Contacted"
  }
}
```

---

## 🎨 Interface utilisateur

### Composant : `AddLeadDialog`

**Nouveaux états** :
- `error` : Message d'erreur à afficher
- `duplicateLead` : Informations sur le lead en doublon

**Affichage conditionnel** :
- Si erreur simple → Boîte rouge avec message
- Si doublon détecté → Boîte rouge + Boîte jaune avec détails + Lien Salesforce

---

## 🚫 Ce qui est bloqué

### Email

Si un lead existe déjà avec l'email :
- `antonin.bazin@gmail.com`
- `john@acme.com`
- `test@example.com`

→ Impossible de créer un nouveau lead avec le même email

### Téléphone

Si un lead existe déjà avec le téléphone :
- `+33662477693`
- `+1 (555) 123-4567`
- `0612345678`

→ Impossible de créer un nouveau lead avec le même téléphone

---

## 🔐 Gestion des erreurs Salesforce

### Erreur native Salesforce : `DUPLICATES_DETECTED`

Si Salesforce détecte un doublon malgré nos vérifications (règles personnalisées), le système :

1. Capture l'erreur `DUPLICATES_DETECTED`
2. Affiche un message clair : "Un lead similaire existe déjà dans Salesforce"
3. Retourne un code `409 Conflict`

**Pourquoi cette double vérification ?**
- Notre vérification (email/téléphone) est rapide et précise
- La vérification Salesforce (règles de dédoublonnage) est un filet de sécurité

---

## 📊 Avantages

1. **Évite les doublons** : Base de données propre
2. **Expérience utilisateur claire** : Messages explicites
3. **Gain de temps** : Lien direct vers le lead existant
4. **Proactif** : Vérification AVANT la création (pas d'erreur Salesforce)
5. **Sécurisé** : Validation côté serveur

---

## 🧪 Tests

### Test 1 : Email en doublon

1. Créez un lead avec email `test@example.com`
2. Essayez de créer un autre lead avec le même email
3. ✅ Vérifiez que la création est bloquée
4. ✅ Vérifiez que les détails du lead existant s'affichent

### Test 2 : Téléphone en doublon

1. Créez un lead avec téléphone `+33662477693`
2. Essayez de créer un autre lead avec le même téléphone
3. ✅ Vérifiez que la création est bloquée
4. ✅ Vérifiez que les détails du lead existant s'affichent

### Test 3 : Sans doublon

1. Créez un lead avec des données uniques
2. ✅ Vérifiez que le lead est créé
3. ✅ Vérifiez qu'il apparaît dans la liste
4. ✅ Vérifiez qu'il existe dans Salesforce

---

## 📝 Notes techniques

### Performance

- Les requêtes de vérification sont rapides (LIMIT 1)
- Index Salesforce sur `Email` et `Phone` pour optimisation
- Vérifications en série (pas de création si email doublon)

### Sécurité

- Échappement des caractères spéciaux dans les requêtes SOQL
- Validation côté serveur (pas seulement client)
- Gestion des erreurs avec try/catch

### Extensibilité

Facilement extensible pour vérifier d'autres champs :
- Nom + Entreprise
- Numéro de téléphone mobile
- Adresse email secondaire
- etc.

---

## 📚 Fichiers modifiés

```
✅ app/api/salesforce/leads/route.ts        (vérification des doublons)
✅ app/(dashboard)/add-lead-dialog.tsx      (affichage des erreurs)
✅ DUPLICATE_PREVENTION.md                   (cette documentation)
```

---

## 🎉 Résultat final

**Avant** :
- ❌ Création de doublons possible
- ❌ Erreur Salesforce peu claire
- ❌ Pas d'information sur le lead existant

**Maintenant** :
- ✅ Doublons bloqués automatiquement
- ✅ Messages d'erreur clairs et explicites
- ✅ Affichage des détails du lead existant
- ✅ Lien direct vers Salesforce
- ✅ Meilleure expérience utilisateur














