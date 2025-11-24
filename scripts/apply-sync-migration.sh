#!/bin/bash

# Apply Salesforce Lead Sync Migration
# This script adds salesforce_id and last_synced_at fields to the leads table

echo "🔄 Application de la migration Salesforce Lead Sync..."
echo ""

# Check if DATABASE_URL or POSTGRES_URL is set
if [ -z "$POSTGRES_URL" ] && [ -z "$DATABASE_URL" ]; then
  echo "❌ Erreur: POSTGRES_URL ou DATABASE_URL doit être défini"
  echo ""
  echo "Définissez-le avec:"
  echo "  export POSTGRES_URL='votre_connection_string'"
  echo ""
  exit 1
fi

# Use POSTGRES_URL if set, otherwise DATABASE_URL
DB_URL="${POSTGRES_URL:-$DATABASE_URL}"

echo "📊 Base de données: $DB_URL"
echo ""

# Apply migration
echo "Exécution du script SQL..."
psql "$DB_URL" -f drizzle/0006_add_salesforce_id_to_leads.sql

if [ $? -eq 0 ]; then
  echo ""
  echo "✅ Migration appliquée avec succès!"
  echo ""
  echo "Les champs suivants ont été ajoutés à la table 'leads':"
  echo "  - salesforce_id (TEXT)"
  echo "  - last_synced_at (TIMESTAMP)"
  echo ""
  echo "🎉 Vous pouvez maintenant synchroniser vos leads avec Salesforce!"
  echo ""
  echo "Prochaines étapes:"
  echo "  1. Redémarrez votre serveur: npm run dev"
  echo "  2. Allez sur /leads"
  echo "  3. Cliquez sur 'Synchroniser avec Salesforce'"
else
  echo ""
  echo "❌ Erreur lors de l'application de la migration"
  echo ""
  echo "Vérifiez:"
  echo "  - Que la base de données est accessible"
  echo "  - Que vous avez les permissions nécessaires"
  echo "  - Que la migration n'a pas déjà été appliquée"
  exit 1
fi














