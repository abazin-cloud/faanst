#!/bin/bash

# Script pour appliquer la migration du configurateur véhicule

echo "🚗 Migration du Configurateur Véhicule"
echo "======================================"
echo ""

# Charger les variables d'environnement
if [ -f .env.local ]; then
    export $(cat .env.local | grep -v '^#' | xargs)
fi

if [ -z "$POSTGRES_URL" ]; then
    echo "❌ Erreur: POSTGRES_URL n'est pas défini dans .env.local"
    exit 1
fi

echo "✅ Base de données détectée"
echo ""

# Vérifier si psql est disponible
if ! command -v psql &> /dev/null; then
    echo "⚠️  psql n'est pas installé. Vous devrez appliquer la migration manuellement."
    echo ""
    echo "Option 1: Utilisez Drizzle Kit"
    echo "  pnpm db:push"
    echo ""
    echo "Option 2: Copiez le contenu de drizzle/0002_vehicle_configurator.sql"
    echo "  et exécutez-le dans la console SQL de Neon"
    echo ""
    exit 0
fi

echo "📝 Application de la migration..."
echo ""

# Appliquer la migration
psql "$POSTGRES_URL" -f drizzle/0002_vehicle_configurator.sql

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Migration appliquée avec succès !"
    echo ""
    echo "Prochaines étapes:"
    echo "1. Importez vos véhicules via /settings"
    echo "2. Testez le configurateur sur /configurateur"
    echo "3. Consultez CONFIGURATEUR_GUIDE.md pour plus d'infos"
else
    echo ""
    echo "❌ Erreur lors de l'application de la migration"
    echo ""
    echo "Solution alternative:"
    echo "1. Allez sur console.neon.tech"
    echo "2. Sélectionnez votre projet"
    echo "3. Ouvrez SQL Editor"
    echo "4. Copiez le contenu de drizzle/0002_vehicle_configurator.sql"
    echo "5. Exécutez le script"
fi

