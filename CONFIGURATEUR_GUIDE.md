# 🚗 Guide du Configurateur Véhicule

## Vue d'ensemble

Le configurateur véhicule permet à vos clients de créer une configuration personnalisée en **4 étapes simples** et de générer un **devis PDF** complet.

## ✨ Fonctionnalités

### 📋 Processus en 4 Étapes

1. **Étape 1 : Sélection Modèle & Finition**
   - Affichage de tous les véhicules disponibles
   - Prix de base affiché
   - Description du véhicule
   - Sélection par clic

2. **Étape 2 : Options & Accessoires**
   - Deux catégories : Options et Accessoires
   - Prix additionnels affichés
   - Sélection/désélection multiple
   - Cette étape est optionnelle

3. **Étape 3 : Financement**
   - **Paiement comptant** : Montant total en une fois
   - **Crédit auto** : 
     - Durée configurable (12 à 72 mois)
     - Apport initial optionnel
     - Calcul de mensualité estimée
   - **Leasing / LLD** :
     - Durée configurable (24 à 60 mois)
     - Calcul du loyer mensuel estimé

4. **Étape 4 : Résumé & Génération PDF**
   - Saisie des coordonnées client (nom, email)
   - Récapitulatif complet de la configuration
   - Bouton "Générer le PDF"
   - Le PDF s'ouvre dans une nouvelle fenêtre avec dialogue d'impression

### 📄 Génération PDF

Le PDF généré contient :
- ✅ Informations client
- ✅ Détails du véhicule sélectionné (modèle, finition, prix)
- ✅ Liste complète des options et accessoires avec prix
- ✅ Détails du financement choisi
- ✅ Prix total TTC
- ✅ Mise en page professionnelle
- ✅ Prêt à imprimer ou sauvegarder

## 🔧 Configuration dans Settings

### Import CSV/Excel

Accédez à `/settings` pour gérer votre catalogue de véhicules.

#### Format attendu

Le fichier doit contenir :
- **Colonne A** : Modèle du véhicule
- **Colonne B** : Finition

Exemple de fichier CSV :
```csv
Modèle,Finition
Peugeot 208,Active
Peugeot 208,Allure
Peugeot 208,GT Line
Renault Clio,Life
Renault Clio,Techno
Renault Clio,RS Line
```

#### Formats acceptés
- `.csv` (virgule, point-virgule ou tabulation comme séparateur)
- `.xlsx` (Excel)
- `.xls` (Excel ancien format)

#### Fonctionnement
1. Cliquez sur "Choisir un fichier"
2. Sélectionnez votre fichier CSV ou Excel
3. Cliquez sur "Mettre à jour la base véhicules"
4. ✅ La table `vehicles` est mise à jour dans Neon
5. Les véhicules sont immédiatement disponibles dans le configurateur

⚠️ **Important** : L'import **remplace** toutes les données existantes dans la table `vehicles`.

## 📊 Structure de la Base de Données

### Table `vehicles`
```sql
id              SERIAL PRIMARY KEY
model           TEXT NOT NULL              -- Modèle du véhicule
finish          TEXT NOT NULL              -- Finition
base_price      NUMERIC(10, 2)            -- Prix de base (optionnel)
description     TEXT                       -- Description (optionnel)
image_url       TEXT                       -- URL image (optionnel)
created_at      TIMESTAMP
```

### Table `vehicle_options`
```sql
id              SERIAL PRIMARY KEY
name            TEXT NOT NULL              -- Nom de l'option
category        TEXT NOT NULL              -- 'option' ou 'accessoire'
price           NUMERIC(10, 2) NOT NULL    -- Prix
description     TEXT                       -- Description
image_url       TEXT                       -- URL image
created_at      TIMESTAMP
```

### Table `vehicle_configurations`
```sql
id                      SERIAL PRIMARY KEY
vehicle_id              INTEGER NOT NULL
customer_name           TEXT
customer_email          TEXT
selected_options        TEXT              -- JSON des IDs options
financing_type          TEXT              -- 'comptant', 'credit', 'leasing'
financing_duration      INTEGER           -- Durée en mois
financing_down_payment  NUMERIC(10, 2)    -- Apport initial
total_price             NUMERIC(10, 2)
status                  TEXT              -- 'brouillon', 'envoye', 'accepte'
created_at              TIMESTAMP
updated_at              TIMESTAMP
```

## 🚀 Migration de la Base de Données

### Option 1 : Migration automatique (Recommandée)

```bash
cd my-crm-auto
pnpm db:migrate
```

### Option 2 : SQL Manuel

Copiez le contenu de `/drizzle/0002_vehicle_configurator.sql` et exécutez-le dans la console SQL de Neon.

Le script de migration :
- ✅ Ajoute les colonnes `base_price`, `description`, `image_url` à `vehicles`
- ✅ Crée la table `vehicle_options`
- ✅ Crée la table `vehicle_configurations`
- ✅ Crée les index pour les performances
- ✅ Insère 10 options/accessoires d'exemple

## 📝 Gestion des Options & Accessoires

### Ajouter des Options via SQL

```sql
INSERT INTO vehicle_options (name, category, price, description) VALUES
('Nom de l\'option', 'option', 1500.00, 'Description'),
('Nom de l\'accessoire', 'accessoire', 200.00, 'Description');
```

### Via Drizzle Studio (Recommandé)

```bash
pnpm db:studio
```

Cela ouvre une interface graphique pour gérer toutes vos tables.

## 🎨 Personnalisation

### Modifier les Durées de Financement

Éditez `app/(dashboard)/configurateur/configurator-wizard.tsx` :

```typescript
// Ligne ~486 pour le crédit
<SelectItem value="12">12 mois</SelectItem>
<SelectItem value="24">24 mois</SelectItem>
// Ajoutez vos durées personnalisées

// Ligne ~518 pour le leasing
<SelectItem value="24">24 mois</SelectItem>
<SelectItem value="36">36 mois</SelectItem>
// Ajoutez vos durées personnalisées
```

### Modifier le Calcul des Mensualités

Dans le même fichier, ligne ~89-91 :

```typescript
// Pour le crédit
Math.round((totalPrice - config.financingDownPayment) / config.financingDuration)

// Pour le leasing (coefficient 0.85 = 85% du prix)
Math.round(totalPrice / config.financingDuration * 0.85)
```

### Personnaliser le Design du PDF

Éditez `app/api/configurateur/generate-pdf/route.ts` :
- Modifiez les styles CSS dans la balise `<style>`
- Changez les couleurs (actuellement bleu #2563eb)
- Ajoutez votre logo
- Modifiez le format et la mise en page

## 🔍 Utilisation

### Pour vos Clients

1. Accédez à `/configurateur`
2. Suivez les 4 étapes
3. Générez le PDF
4. Imprimez ou sauvegardez

### Pour l'Admin

1. Importez vos véhicules via `/settings`
2. Ajoutez des options via Drizzle Studio ou SQL
3. Consultez les configurations sauvegardées (fonctionnalité future)

## 🐛 Dépannage

### "Aucun véhicule disponible"

→ Allez dans `/settings` et importez un fichier CSV/Excel avec vos véhicules

### "Aucune option disponible"

→ Les options sont optionnelles, mais vous pouvez en ajouter :
```bash
pnpm db:studio
```
Puis ajoutez des entrées dans la table `vehicle_options`

### Erreur lors de l'import CSV

→ Vérifiez que :
- Le fichier contient bien 2 colonnes
- La première ligne peut être un en-tête (il sera ignoré s'il contient "modèle" et "finition")
- Les cellules ne sont pas vides
- Le format est CSV (virgule, point-virgule ou tab comme séparateur) ou Excel

### Le PDF ne s'ouvre pas

→ Vérifiez :
- Que les popups ne sont pas bloquées par votre navigateur
- Que vous avez rempli tous les champs requis (nom et email à l'étape 4)
- La console du navigateur pour les erreurs

## 🎯 Prochaines Améliorations Possibles

- [ ] Interface admin pour gérer les options (CRUD complet)
- [ ] Upload d'images pour les véhicules et options
- [ ] Sauvegarde des configurations clients dans la base
- [ ] Envoi automatique du PDF par email
- [ ] Calculateur de crédit avec taux d'intérêt réels
- [ ] Comparateur de configurations
- [ ] Export des configurations en format JSON
- [ ] Interface de gestion des devis envoyés

## 📞 Support

Pour toute question sur le configurateur :
1. Consultez ce guide
2. Vérifiez les migrations dans `/drizzle`
3. Examinez le code dans `/app/(dashboard)/configurateur`

---

**Bon configurage ! 🚗💨**




