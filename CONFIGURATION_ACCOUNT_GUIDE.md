# Guide : Liaison de Configurations aux Comptes Clients

## Vue d'ensemble

Cette fonctionnalité permet de lier les configurations de véhicules créées dans le configurateur aux comptes clients existants ou de créer automatiquement de nouveaux comptes clients lors de l'enregistrement d'une configuration.

## Fonctionnalités principales

### 1. **Enregistrement de configurations**
À l'étape 4 (Résumé) du configurateur, vous pouvez maintenant :
- **Lier à un compte existant** : Sélectionnez un compte client dans une liste déroulante
- **Créer un nouveau compte** : Remplissez les informations (entreprise, contact, email, téléphone) et le compte sera créé automatiquement

### 2. **Page de détail de compte**
Chaque compte dispose maintenant d'une page dédiée accessible via `/customers/[id]` qui affiche :
- **Informations du compte** : Coordonnées complètes, secteur d'activité, etc.
- **Configurations liées** : Toutes les configurations de véhicules associées au compte
- **Opportunités** : Opportunités commerciales liées au compte

### 3. **Détails des configurations**
Pour chaque configuration enregistrée, vous pouvez voir :
- Modèle, finition et couleur
- Prix total et mensualité
- Type et durée de financement
- Options et accessoires sélectionnés
- Statut de la configuration (brouillon, envoyé, accepté)

## Installation et migration de la base de données

### Étape 1 : Appliquer la migration

La migration `0003_link_configurations_to_accounts.sql` ajoute :
- Une colonne `account_id` pour lier les configurations aux comptes
- Des colonnes supplémentaires pour stocker les détails de la configuration
- Un index pour améliorer les performances

Pour appliquer la migration :

```bash
# Option 1 : Utiliser le script de migration existant
cd my-crm-auto
./migrate.sh

# Option 2 : Appliquer manuellement via psql
psql $POSTGRES_URL -f drizzle/0003_link_configurations_to_accounts.sql

# Option 3 : Utiliser le script de migration Node.js
node scripts/migrate-db.js
```

### Étape 2 : Vérifier la migration

Connectez-vous à votre base de données et vérifiez que :

```sql
-- Vérifier que la colonne account_id existe
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'vehicle_configurations' 
  AND column_name = 'account_id';

-- Vérifier l'index
SELECT indexname 
FROM pg_indexes 
WHERE tablename = 'vehicle_configurations' 
  AND indexname = 'idx_vehicle_configurations_account_id';
```

## Utilisation

### Créer et enregistrer une configuration

1. **Accédez au configurateur** : `/configurateur`
2. **Configurez votre véhicule** :
   - Étape 1 : Choisissez le modèle et la finition
   - Étape 2 : Sélectionnez les options et accessoires
   - Étape 3 : Définissez le financement et l'assurance
   - Étape 4 : Résumé

3. **Enregistrez la configuration** :
   - Cliquez sur "Enregistrer cette configuration"
   - Choisissez entre "Compte existant" ou "Nouveau compte"
   - Remplissez les informations requises
   - Cliquez sur "Enregistrer"

4. **Redirection automatique** : Vous serez automatiquement redirigé vers la page de détail du compte

### Consulter les configurations d'un compte

1. **Accédez aux comptes clients** : `/customers`
2. **Cliquez sur un compte** pour voir ses détails
3. **Consultez l'onglet "Configurations"** pour voir toutes les configurations liées

## Structure de la base de données

### Modifications de `vehicle_configurations`

```sql
CREATE TABLE vehicle_configurations (
  id SERIAL PRIMARY KEY,
  vehicle_id INTEGER NOT NULL,
  account_id INTEGER,  -- NOUVEAU : Lien vers le compte
  customer_name TEXT,
  customer_email TEXT,
  model_name TEXT,     -- NOUVEAU : Nom du modèle
  finish_name TEXT,    -- NOUVEAU : Nom de la finition
  color_name TEXT,     -- NOUVEAU : Nom de la couleur
  selected_options TEXT,
  selected_accessories TEXT,  -- NOUVEAU
  financing_type TEXT,
  financing_duration INTEGER,
  financing_down_payment NUMERIC(10, 2),
  insurance_plan TEXT,        -- NOUVEAU : Détails de l'assurance
  monthly_payment NUMERIC(10, 2),  -- NOUVEAU
  total_price NUMERIC(10, 2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'brouillon',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

## API et Actions serveur

### `saveConfiguration(data: SaveConfigurationData)`

Enregistre une configuration et crée un compte si nécessaire.

**Paramètres** :
```typescript
type SaveConfigurationData = {
  vehicleId: number;
  accountId?: number;  // Pour lier à un compte existant
  modelName: string;
  finishName: string;
  colorName: string;
  selectedOptions: string[];
  selectedAccessories: string[];
  financingType: string;
  financingDuration: number;
  financingDownPayment: number;
  insurancePlan: {
    id: string;
    name: string;
    monthlyPrice: number;
  };
  monthlyPayment: number;
  totalPrice: number;
  newAccount?: {  // Pour créer un nouveau compte
    companyName: string;
    contactName: string;
    email: string;
    phone?: string;
  };
};
```

**Retour** :
```typescript
{
  success: boolean;
  configurationId?: number;
  accountId?: number;
  error?: string;
}
```

### `getAccountsList()`

Récupère la liste de tous les comptes pour la sélection dans le configurateur.

### `getVehicleConfigurationsByAccountId(accountId: number)`

Récupère toutes les configurations liées à un compte spécifique.

## Composants

### `SaveConfigurationDialog`

Composant de dialogue pour enregistrer une configuration.

**Props** :
```typescript
type SaveConfigurationDialogProps = {
  configurationData: Omit<SaveConfigurationData, 'accountId' | 'newAccount'>;
  children?: React.ReactNode;
};
```

**Utilisation** :
```tsx
<SaveConfigurationDialog
  configurationData={{
    vehicleId: 1,
    modelName: "Tesla Model 3",
    finishName: "Performance",
    colorName: "Bleu Nuit",
    selectedOptions: ["opt1", "opt2"],
    selectedAccessories: ["acc1"],
    financingType: "leasing",
    financingDuration: 48,
    financingDownPayment: 5000,
    insurancePlan: {
      id: "premium",
      name: "Assurance Premium",
      monthlyPrice: 89
    },
    monthlyPayment: 599,
    totalPrice: 45000
  }}
/>
```

## Améliorations futures possibles

- [ ] Édition des configurations sauvegardées
- [ ] Duplication de configurations
- [ ] Envoi de configurations par email
- [ ] Export PDF des configurations depuis la page de compte
- [ ] Historique des modifications de configuration
- [ ] Notifications lors de la création d'une configuration
- [ ] Filtrage et recherche de configurations
- [ ] Statistiques sur les configurations les plus populaires

## Dépannage

### La migration échoue

Si la migration échoue, vérifiez :
- Que vous avez les bonnes permissions sur la base de données
- Que la table `vehicle_configurations` existe
- Que les migrations précédentes ont été appliquées

### Les configurations ne s'affichent pas

Vérifiez :
- Que la colonne `account_id` existe dans la table `vehicle_configurations`
- Que les configurations ont bien un `account_id` non null
- Les logs de la console du navigateur pour les erreurs

### Erreur lors de l'enregistrement

Consultez :
- Les logs du serveur Next.js
- La console du navigateur
- Vérifiez que tous les champs requis sont remplis

## Support

Pour toute question ou problème, consultez :
- Les logs de l'application : `console.log` dans le navigateur et les logs Next.js
- La documentation de Drizzle ORM : https://orm.drizzle.team/
- La documentation de Next.js : https://nextjs.org/docs



