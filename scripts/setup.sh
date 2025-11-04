#!/bin/bash

# BPC Funnels - Script d'Installation Automatique
# Usage: ./scripts/setup.sh

set -e

echo "🚀 BPC Funnels - Installation Automatique"
echo "=========================================="
echo ""

# Couleurs pour output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Fonction d'erreur
error() {
    echo -e "${RED}❌ Erreur: $1${NC}"
    exit 1
}

# Fonction de succès
success() {
    echo -e "${GREEN}✅ $1${NC}"
}

# Fonction d'info
info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Fonction de warning
warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# 1. Vérifier Node.js version
echo "1️⃣  Vérification de Node.js..."
if ! command -v node &> /dev/null; then
    error "Node.js n'est pas installé. Installez Node.js 20+ depuis https://nodejs.org"
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 20 ]; then
    error "Node.js 20+ requis. Version actuelle: $(node -v). Utilisez 'nvm install 20' ou téléchargez depuis nodejs.org"
fi

success "Node.js $(node -v) détecté"
echo ""

# 2. Installer les dépendances
echo "2️⃣  Installation des dépendances npm..."
if [ ! -d "node_modules" ]; then
    npm install || error "Échec de l'installation des dépendances"
    success "Dépendances installées"
else
    info "node_modules existe déjà, skip..."
fi
echo ""

# 3. Configuration .env.local
echo "3️⃣  Configuration de l'environnement..."

if [ -f ".env.local" ]; then
    # Vérifier si le fichier contient des valeurs d'exemple
    if grep -q "xxxxx" .env.local || grep -q "your-" .env.local; then
        warning ".env.local existe mais contient des valeurs d'exemple"
        read -p "Voulez-vous reconfigurer? (o/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Oo]$ ]]; then
            rm .env.local
        else
            info "Conservation de .env.local existant"
        fi
    else
        success ".env.local déjà configuré"
        echo ""
    fi
fi

if [ ! -f ".env.local" ]; then
    echo ""
    echo "📝 Configuration Supabase"
    echo "========================="
    echo ""
    echo "Allez sur https://supabase.com/dashboard/project/VOTRE-PROJET/settings/api"
    echo ""
    
    read -p "Project URL (https://xxxxx.supabase.co): " SUPABASE_URL
    read -p "anon public key: " SUPABASE_ANON_KEY
    read -p "service_role key: " SUPABASE_SERVICE_KEY
    
    # Créer .env.local
    cat > .env.local << EOF
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=${SUPABASE_URL}
NEXT_PUBLIC_SUPABASE_ANON_KEY=${SUPABASE_ANON_KEY}
SUPABASE_SERVICE_ROLE_KEY=${SUPABASE_SERVICE_KEY}

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
EOF
    
    success ".env.local créé"
fi
echo ""

# 4. Tester la connexion Supabase
echo "4️⃣  Test de connexion Supabase..."
SUPABASE_URL=$(grep NEXT_PUBLIC_SUPABASE_URL .env.local | cut -d'=' -f2)

if [ -z "$SUPABASE_URL" ] || echo "$SUPABASE_URL" | grep -q "xxxxx"; then
    error ".env.local n'est pas correctement configuré"
fi

# Ping Supabase
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "${SUPABASE_URL}/rest/v1/" -H "apikey: $(grep NEXT_PUBLIC_SUPABASE_ANON_KEY .env.local | cut -d'=' -f2)" || echo "000")

if [ "$HTTP_CODE" == "200" ] || [ "$HTTP_CODE" == "401" ]; then
    success "Connexion Supabase OK (HTTP $HTTP_CODE)"
else
    warning "Impossible de joindre Supabase (HTTP $HTTP_CODE)"
    echo "   Vérifiez votre URL et votre connexion internet"
fi
echo ""

# 5. Vérifier/exécuter les migrations
echo "5️⃣  Migrations SQL..."
echo ""
info "Vous devez exécuter manuellement les migrations dans Supabase:"
echo ""
echo "   1. Ouvrez ${SUPABASE_URL}/project/_/sql"
echo "   2. Copiez le contenu de: supabase/migrations/20250104_initial_schema.sql"
echo "   3. Exécutez le script"
echo ""
read -p "Migrations exécutées? (o/N): " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Oo]$ ]]; then
    warning "⚠️  N'oubliez pas d'exécuter les migrations avant de lancer l'app!"
fi
echo ""

# 6. Créer l'utilisateur admin
echo "6️⃣  Utilisateur admin..."
echo ""
info "Pour créer votre compte admin:"
echo ""
echo "   1. Ouvrez ${SUPABASE_URL}/project/_/auth/users"
echo "   2. Cliquez sur 'Add user' > 'Create new user'"
echo "   3. Email: votre@email.com"
echo "   4. Password: votre-mot-de-passe"
echo "   5. Cochez 'Auto Confirm User'"
echo ""
read -p "Utilisateur créé? (o/N): " -n 1 -r
echo ""
echo ""

# 7. Nettoyer le cache
echo "7️⃣  Nettoyage du cache..."
rm -rf .next 2>/dev/null || true
success "Cache nettoyé"
echo ""

# 8. Prêt à lancer
echo "=========================================="
echo -e "${GREEN}🎉 Installation terminée !${NC}"
echo "=========================================="
echo ""
echo "Pour lancer le serveur de développement:"
echo ""
echo -e "   ${BLUE}npm run dev${NC}"
echo ""
echo "Puis ouvrez http://localhost:3000"
echo ""
echo "📚 Documentation:"
echo "   - README.md : Guide complet"
echo "   - QUICK_START.md : Démarrage rapide"
echo "   - DEPLOYMENT.md : Déploiement production"
echo ""
echo "Bon développement ! 🚀"
echo ""

