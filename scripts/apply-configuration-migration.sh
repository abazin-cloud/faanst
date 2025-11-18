#!/bin/bash

# Script pour appliquer la migration de liaison des configurations aux comptes
# Usage: ./scripts/apply-configuration-migration.sh

set -e

echo "🚀 Application de la migration de liaison des configurations aux comptes..."
echo ""

# Se déplacer à la racine du projet si nécessaire
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
cd "$PROJECT_ROOT"

# Charger les variables d'environnement depuis .env.local s'il existe
if [ -f .env.local ]; then
  echo "📄 Chargement de .env.local..."
  export $(grep -v '^#' .env.local | xargs)
fi

# Vérifier que POSTGRES_URL est défini
if [ -z "$POSTGRES_URL" ]; then
  echo "❌ Erreur: La variable d'environnement POSTGRES_URL n'est pas définie."
  echo ""
  echo "   Solutions:"
  echo "   1. Créez un fichier .env.local à la racine du projet avec:"
  echo "      POSTGRES_URL=votre_url_postgresql"
  echo ""
  echo "   2. Ou exportez la variable dans votre shell:"
  echo "      export POSTGRES_URL=votre_url_postgresql"
  echo ""
  exit 1
fi

echo "📊 Base de données détectée."
echo ""

# Appliquer la migration
echo "⏳ Application de la migration 0003_link_configurations_to_accounts.sql..."
if command -v psql &> /dev/null; then
  psql "$POSTGRES_URL" -f drizzle/0003_link_configurations_to_accounts.sql
  echo "✅ Migration appliquée avec succès!"
else
  echo "⚠️  psql n'est pas installé. Vous pouvez appliquer la migration manuellement:"
  echo "   psql \$POSTGRES_URL -f drizzle/0003_link_configurations_to_accounts.sql"
  echo ""
  echo "   Ou utiliser le client Neon SQL Editor:"
  echo "   https://console.neon.tech/"
fi

echo ""
echo "🔍 Vérification de la migration..."

# Vérifier la migration (optionnel si psql est disponible)
if command -v psql &> /dev/null; then
  echo ""
  echo "📝 Colonnes de vehicle_configurations:"
  psql "$POSTGRES_URL" -c "SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'vehicle_configurations' ORDER BY ordinal_position;"
  
  echo ""
  echo "🔑 Index sur vehicle_configurations:"
  psql "$POSTGRES_URL" -c "SELECT indexname FROM pg_indexes WHERE tablename = 'vehicle_configurations';"
fi

echo ""
echo "✨ Migration terminée!"
echo ""
echo "📚 Consultez CONFIGURATION_ACCOUNT_GUIDE.md pour plus d'informations sur l'utilisation."

