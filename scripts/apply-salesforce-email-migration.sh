#!/bin/bash

# Script pour appliquer la migration 0007_add_salesforce_email
# Ajoute le champ salesforce_email à la table users

set -e

echo "🔄 Application de la migration 0007_add_salesforce_email..."

# Vérifier que POSTGRES_URL est défini
if [ -z "$POSTGRES_URL" ]; then
  echo "❌ Erreur: POSTGRES_URL n'est pas défini"
  echo "Définissez la variable d'environnement POSTGRES_URL avec votre chaîne de connexion Neon"
  exit 1
fi

# Appliquer la migration
echo "📝 Ajout du champ salesforce_email à la table users..."
psql "$POSTGRES_URL" -f drizzle/0007_add_salesforce_email.sql

echo "✅ Migration appliquée avec succès!"
echo ""
echo "ℹ️  Le champ salesforce_email a été ajouté à la table users."
echo "   Les utilisateurs peuvent maintenant configurer un email Salesforce différent"
echo "   de leur email de connexion dans les Paramètres."














