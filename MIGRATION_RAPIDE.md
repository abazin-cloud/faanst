# Migration Rapide - Guide de Dépannage

## 🔧 Le script de migration ne fonctionne pas ?

Pas de panique ! Voici plusieurs solutions :

## Solution 1 : Vérifier votre fichier .env.local

Ouvrez votre fichier `.env.local` et assurez-vous qu'il contient :

```bash
POSTGRES_URL=votre_url_postgresql_ici
```

**Exemple typique avec Neon :**
```bash
POSTGRES_URL=postgresql://username:password@ep-xxxxx.region.aws.neon.tech/dbname?sslmode=require
```

Si la ligne n'existe pas, ajoutez-la et réessayez le script.

## Solution 2 : Appliquer la migration manuellement (Recommandé)

### Méthode A : Via Neon Console (Plus simple)

1. Allez sur https://console.neon.tech/
2. Sélectionnez votre projet
3. Cliquez sur "SQL Editor" dans le menu de gauche
4. Copiez et collez le contenu ci-dessous :

```sql
-- Migration pour lier les configurations aux comptes

-- Ajouter la colonne account_id à vehicle_configurations
ALTER TABLE vehicle_configurations 
ADD COLUMN IF NOT EXISTS account_id INTEGER REFERENCES accounts(id);

-- Ajouter des colonnes supplémentaires pour capturer plus d'informations de la configuration
ALTER TABLE vehicle_configurations
ADD COLUMN IF NOT EXISTS model_name TEXT,
ADD COLUMN IF NOT EXISTS finish_name TEXT,
ADD COLUMN IF NOT EXISTS color_name TEXT,
ADD COLUMN IF NOT EXISTS selected_accessories TEXT,
ADD COLUMN IF NOT EXISTS insurance_plan TEXT,
ADD COLUMN IF NOT EXISTS monthly_payment NUMERIC(10, 2);

-- Créer un index pour améliorer les performances de recherche par compte
CREATE INDEX IF NOT EXISTS idx_vehicle_configurations_account_id ON vehicle_configurations(account_id);

-- Mettre à jour le commentaire de la table
COMMENT ON TABLE vehicle_configurations IS 'Configurations de véhicules sauvegardées et liées aux comptes clients';
COMMENT ON COLUMN vehicle_configurations.account_id IS 'ID du compte client associé à cette configuration';
```

5. Cliquez sur "Run" ou appuyez sur Ctrl+Enter
6. Vérifiez que le message "Success" s'affiche
7. C'est fait ! ✅

### Méthode B : Via psql dans le terminal

Si vous avez psql installé :

```bash
# Exportez d'abord votre URL de connexion
export POSTGRES_URL="votre_url_postgresql_ici"

# Puis appliquez la migration
psql "$POSTGRES_URL" -f drizzle/0003_link_configurations_to_accounts.sql
```

### Méthode C : Via un client SQL

Si vous utilisez un client SQL comme TablePlus, pgAdmin, DBeaver, etc. :

1. Connectez-vous à votre base de données
2. Ouvrez le fichier `drizzle/0003_link_configurations_to_accounts.sql`
3. Exécutez le script SQL
4. Vérifiez que tout s'est bien passé

## Solution 3 : Exporter la variable dans votre shell

Si vous préférez utiliser le script bash :

```bash
# Exportez la variable d'environnement
export POSTGRES_URL="votre_url_postgresql_ici"

# Puis exécutez le script
./scripts/apply-configuration-migration.sh
```

## ✅ Vérifier que la migration a fonctionné

Exécutez cette requête SQL dans votre console Neon ou via psql :

```sql
-- Vérifier que les nouvelles colonnes existent
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'vehicle_configurations' 
  AND column_name IN ('account_id', 'model_name', 'finish_name', 'color_name', 'selected_accessories', 'insurance_plan', 'monthly_payment')
ORDER BY column_name;
```

Vous devriez voir 7 lignes de résultats. Si oui, tout est bon ! ✅

## 🚀 Après la migration

Une fois la migration appliquée :

1. **Démarrez votre serveur** :
   ```bash
   npm run dev
   # ou
   pnpm dev
   ```

2. **Testez les fonctionnalités** :
   - Allez sur http://localhost:3000/configurateur
   - Configurez un véhicule
   - À l'étape 4, cliquez sur "Enregistrer cette configuration"
   - Créez un nouveau compte ou liez à un existant
   - Vérifiez que tout fonctionne !

## 🆘 Besoin d'aide ?

### Erreur : "relation 'vehicle_configurations' does not exist"

La table n'existe pas encore. Vous devez d'abord appliquer la migration `0002_vehicle_configurator.sql` :

```bash
psql "$POSTGRES_URL" -f drizzle/0002_vehicle_configurator.sql
```

Puis réessayez la migration `0003_link_configurations_to_accounts.sql`.

### Erreur : "relation 'accounts' does not exist"

La table accounts n'existe pas. Vérifiez que votre base de données contient bien toutes les tables nécessaires. Vous devrez peut-être exécuter toutes les migrations depuis le début.

### Le serveur ne démarre pas

1. Vérifiez que `POSTGRES_URL` est bien défini dans `.env.local`
2. Vérifiez qu'il n'y a pas d'erreurs TypeScript :
   ```bash
   npm run build
   ```
3. Consultez les logs du terminal pour plus d'informations

## 📞 Support

Si vous rencontrez toujours des problèmes :
1. Vérifiez les logs du terminal
2. Vérifiez la console de votre navigateur (F12)
3. Consultez les fichiers de documentation dans le projet

---

**Recommandation** : Utilisez la méthode A (Neon Console) si vous débutez - c'est la plus simple ! ✨



















