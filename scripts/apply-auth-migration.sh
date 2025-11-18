#!/bin/bash

# Script pour appliquer les migrations d'authentification
# Usage: ./scripts/apply-auth-migration.sh

set -e

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}🔐 Application des migrations d'authentification...${NC}\n"

# Déterminer le répertoire du script et le répertoire du projet
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$( cd "$SCRIPT_DIR/.." && pwd )"

# Se placer dans le répertoire du projet
cd "$PROJECT_ROOT"

# Charger les variables d'environnement depuis .env.local
if [ -f ".env.local" ]; then
    echo -e "${GREEN}✓ Chargement des variables depuis .env.local${NC}"
    export $(cat .env.local | grep -v '^#' | grep -v '^$' | xargs)
else
    echo -e "${RED}❌ Erreur: Fichier .env.local non trouvé${NC}"
    echo -e "${YELLOW}💡 Solution: Créez un fichier .env.local avec votre POSTGRES_URL${NC}"
    exit 1
fi

# Vérifier que POSTGRES_URL est définie
if [ -z "$POSTGRES_URL" ]; then
    echo -e "${RED}❌ Erreur: La variable d'environnement POSTGRES_URL n'est pas définie.${NC}"
    echo -e "${YELLOW}💡 Solution: Ajoutez POSTGRES_URL='votre_url_neon' dans .env.local${NC}"
    exit 1
fi

echo -e "${GREEN}✓ POSTGRES_URL trouvée${NC}\n"

# Appliquer la migration 0004 (création des tables auth)
echo -e "${YELLOW}📄 Application de la migration 0004_create_auth_tables.sql...${NC}"
if psql "$POSTGRES_URL" -f drizzle/0004_create_auth_tables.sql; then
    echo -e "${GREEN}✓ Migration 0004 appliquée avec succès${NC}\n"
else
    echo -e "${YELLOW}⚠️  La migration 0004 a peut-être déjà été appliquée${NC}\n"
fi

# Appliquer la migration 0005 (ajout de password)
echo -e "${YELLOW}📄 Application de la migration 0005_add_password_to_users.sql...${NC}"
if psql "$POSTGRES_URL" -f drizzle/0005_add_password_to_users.sql; then
    echo -e "${GREEN}✓ Migration 0005 appliquée avec succès${NC}\n"
else
    echo -e "${RED}❌ Erreur lors de l'application de la migration 0005${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Toutes les migrations ont été appliquées avec succès!${NC}\n"

echo -e "${YELLOW}📝 Prochaines étapes:${NC}"
echo -e "1. Créez un utilisateur avec: ${GREEN}node scripts/generate-password-hash.js${NC}"
echo -e "2. Lancez l'application: ${GREEN}pnpm run dev${NC}"
echo -e "3. Allez sur ${GREEN}http://localhost:3000/login${NC}\n"


