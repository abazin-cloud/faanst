# Guide de Démarrage Rapide - Configurations liées aux Comptes

## 🚀 Mise en route rapide (5 minutes)

### Étape 1 : Appliquer la migration (2 min)

```bash
cd /Users/a.bazin/Documents/faanst/my-crm-auto

# Option simple : Script automatisé
./scripts/apply-configuration-migration.sh

# OU Option manuelle avec psql
psql $POSTGRES_URL -f drizzle/0003_link_configurations_to_accounts.sql
```

**Note** : Si vous utilisez Neon, vous pouvez aussi copier/coller le contenu de `drizzle/0003_link_configurations_to_accounts.sql` dans le SQL Editor de Neon.

### Étape 2 : Tester la fonctionnalité (3 min)

#### Test 1 : Créer une configuration avec un nouveau compte

1. Démarrez votre serveur de développement :
   ```bash
   npm run dev
   # ou
   pnpm dev
   ```

2. Ouvrez le configurateur : http://localhost:3000/configurateur

3. Configurez un véhicule en suivant les 4 étapes

4. À l'étape 4 (Résumé), cliquez sur **"Enregistrer cette configuration"**

5. Dans le dialogue :
   - Sélectionnez l'onglet **"Nouveau compte"**
   - Remplissez :
     - Nom de l'entreprise : "Test SARL"
     - Nom du contact : "Jean Test"
     - Email : "jean@test.fr"
     - Téléphone : "06 12 34 56 78" (optionnel)
   - Cliquez sur **"Enregistrer"**

6. Vous serez redirigé vers la page du compte nouvellement créé

7. Vérifiez que votre configuration apparaît dans l'onglet **"Configurations"**

#### Test 2 : Lier une configuration à un compte existant

1. Retournez au configurateur : http://localhost:3000/configurateur

2. Configurez un autre véhicule

3. À l'étape 4, cliquez sur **"Enregistrer cette configuration"**

4. Dans le dialogue :
   - Restez sur l'onglet **"Compte existant"**
   - Sélectionnez "Test SARL - Jean Test" dans la liste
   - Cliquez sur **"Enregistrer"**

5. Vous serez redirigé vers la page du compte

6. Vérifiez que les **2 configurations** apparaissent maintenant

#### Test 3 : Consulter les configurations d'un compte

1. Allez sur la page des comptes : http://localhost:3000/customers

2. Cliquez sur **"Voir le détail"** pour le compte "Test SARL"

3. Vérifiez l'affichage :
   - Informations du compte en haut
   - Onglet "Configurations" avec vos 2 configurations
   - Détails de chaque configuration (prix, options, etc.)

## ✅ C'est prêt !

Votre système de liaison de configurations aux comptes est maintenant opérationnel.

## 📊 Que pouvez-vous faire maintenant ?

### 1. **Dans le configurateur**
- Enregistrer toutes vos configurations
- Créer des comptes à la volée
- Lier à des comptes existants

### 2. **Dans la page des comptes**
- Voir tous les comptes clients
- Cliquer sur un compte pour voir ses détails
- Consulter toutes les configurations d'un compte

### 3. **Dans la page de détail d'un compte**
- Voir les informations complètes du compte
- Consulter l'historique des configurations
- Voir les opportunités liées (si vous en avez)

## 🎯 Flux de travail typique

```
1. Rendez-vous commercial avec un prospect
   ↓
2. Utilisez le configurateur pour créer une offre personnalisée
   ↓
3. Enregistrez la configuration en créant le compte du prospect
   ↓
4. Générez le PDF pour le client
   ↓
5. Plus tard, consultez la page du compte pour :
   - Voir l'historique des configurations proposées
   - Créer de nouvelles configurations pour ce client
   - Suivre les opportunités
```

## 🔍 Où trouver les informations ?

| Page | URL | Description |
|------|-----|-------------|
| Configurateur | `/configurateur` | Créer des configurations |
| Liste des comptes | `/customers` | Voir tous les comptes |
| Détail d'un compte | `/customers/[id]` | Voir un compte et ses configurations |

## 📚 Documentation complète

Pour plus de détails :
- **Guide complet** : `CONFIGURATION_ACCOUNT_GUIDE.md`
- **Changelog** : `CHANGELOG_CONFIGURATIONS.md`
- **Migration SQL** : `drizzle/0003_link_configurations_to_accounts.sql`

## 🆘 Problèmes courants

### La migration échoue
```bash
# Vérifiez que POSTGRES_URL est défini
echo $POSTGRES_URL

# Si vide, créez/éditez .env.local
# et ajoutez : POSTGRES_URL=votre_url_neon
```

### Le dialogue ne s'ouvre pas
- Vérifiez la console du navigateur pour les erreurs
- Assurez-vous d'être à l'étape 4 du configurateur
- Rechargez la page

### Les configurations ne s'affichent pas
- Vérifiez que la migration a été appliquée
- Vérifiez que les configurations ont un `account_id` non null
- Consultez les logs du serveur Next.js

## 💡 Astuce

Pour réinitialiser et tester à nouveau :
```sql
-- Supprimer les configurations de test
DELETE FROM vehicle_configurations WHERE customer_email = 'jean@test.fr';

-- Supprimer le compte de test
DELETE FROM accounts WHERE email = 'jean@test.fr';
```

## 🎉 Profitez de votre nouveau système !

Vous avez maintenant un système complet de gestion de configurations liées aux comptes clients. Bon travail ! 🚀


