#!/bin/bash

# BPC Funnels - Script de Seed (Données de démo)
# Usage: ./scripts/seed.sh

set -e

echo "🌱 BPC Funnels - Seed des données de démo"
echo "=========================================="
echo ""

# Charger les variables d'environnement
if [ ! -f ".env.local" ]; then
    echo "❌ Erreur: .env.local introuvable"
    exit 1
fi

source .env.local

# Message d'info
echo "Ce script va créer:"
echo "  - 1 funnel de démo (actif)"
echo "  - 3 règles de routage d'exemple"
echo "  - 10 leads de test"
echo ""
read -p "Continuer? (o/N): " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Oo]$ ]]; then
    echo "Annulé."
    exit 0
fi

echo ""
echo "📝 Création du funnel de démo..."
echo "Note: Exécutez ce SQL dans Supabase SQL Editor:"
echo "---"

cat << 'EOF'
-- Funnel de démo
INSERT INTO funnels (slug, name, status, description, config) VALUES (
  'demo-flipimmo',
  'FlipImmo - Guide Investissement Immobilier',
  'active',
  'Funnel de démonstration pour collecter des leads investisseurs immobilier',
  '{
    "tracking": {
      "metaPixelId": "",
      "ga4Id": ""
    },
    "variants": [
      {
        "key": "a",
        "weight": 50,
        "landing": {
          "title": "Devenez Investisseur Immobilier Rentable dès 2025",
          "subtitle": "Une méthode claire pour bâtir votre patrimoine sans dépendre des banques",
          "cta": {
            "text": "Accéder au guide gratuit",
            "href": "/form"
          },
          "theme": {
            "primaryColor": "#2563eb",
            "backgroundColor": "#ffffff"
          }
        },
        "steps": [
          {
            "id": "optin",
            "title": "Recevez votre guide gratuit",
            "subtitle": "Remplissez vos coordonnées ci-dessous",
            "fields": [
              {
                "type": "text",
                "name": "firstName",
                "label": "Prénom",
                "placeholder": "Jean",
                "required": true
              },
              {
                "type": "email",
                "name": "email",
                "label": "Email",
                "placeholder": "jean@exemple.fr",
                "required": true
              },
              {
                "type": "tel",
                "name": "phone",
                "label": "Téléphone",
                "placeholder": "06 12 34 56 78",
                "required": false
              }
            ],
            "nextStep": "profil"
          },
          {
            "id": "profil",
            "title": "Parlez-nous de votre projet",
            "fields": [
              {
                "type": "number",
                "name": "capital",
                "label": "Budget disponible (€)",
                "placeholder": "50000",
                "required": true,
                "min": 0
              },
              {
                "type": "radio",
                "name": "goal",
                "label": "Votre objectif principal",
                "required": true,
                "options": [
                  "Apprendre l'\''investissement immobilier",
                  "Acheter mon premier bien",
                  "Développer mon patrimoine",
                  "Me former au marchand de biens"
                ]
              }
            ],
            "nextStep": null
          }
        ],
        "thankYou": {
          "title": "Merci ! Votre demande a été envoyée",
          "message": "Nous reviendrons vers vous sous 24h.",
          "cta": {
            "text": "Prendre rendez-vous",
            "href": "https://calendly.com/example"
          }
        }
      },
      {
        "key": "b",
        "weight": 50,
        "landing": {
          "title": "Formation Gratuite : Devenez Investisseur en 2025",
          "subtitle": "Méthode complète pour réussir sans apport",
          "cta": {
            "text": "Je veux ma formation",
            "href": "/form"
          },
          "theme": {
            "primaryColor": "#dc2626",
            "backgroundColor": "#0f172a"
          }
        },
        "steps": [
          {
            "id": "optin",
            "title": "Accédez à la formation maintenant",
            "fields": [
              {
                "type": "text",
                "name": "firstName",
                "label": "Prénom",
                "required": true
              },
              {
                "type": "email",
                "name": "email",
                "label": "Email",
                "required": true
              }
            ],
            "nextStep": "q1"
          },
          {
            "id": "q1",
            "title": "Quel est votre niveau actuel ?",
            "fields": [
              {
                "type": "radio",
                "name": "level",
                "label": "Vous êtes...",
                "required": true,
                "options": [
                  "Débutant complet",
                  "J'\''ai quelques connaissances",
                  "Déjà investisseur"
                ]
              }
            ],
            "nextStep": "q2"
          },
          {
            "id": "q2",
            "title": "Quel budget pouvez-vous mobiliser ?",
            "fields": [
              {
                "type": "number",
                "name": "capital",
                "label": "Budget (€)",
                "required": true,
                "min": 0
              }
            ],
            "nextStep": null
          }
        ],
        "thankYou": {
          "title": "C'\''est parti ! Consultez votre boîte mail",
          "message": "Vous allez recevoir la formation sous quelques minutes.",
          "cta": null
        }
      }
    ]
  }'::jsonb
) RETURNING id;

-- Récupérer l'ID du funnel créé et créer les règles de routage
-- Remplacez FUNNEL_ID_HERE par l'ID retourné ci-dessus

-- Règle 1: Capital > 50000 → Client Premium
INSERT INTO routing_rules (funnel_id, priority, condition, webhook_url, client_name, is_active) VALUES (
  'FUNNEL_ID_HERE',
  0,
  '{"field": "capital", "operator": ">", "value": 50000}'::jsonb,
  'https://webhook.site/your-unique-url',
  'FMDB - Client Premium',
  true
);

-- Règle 2: Capital <= 50000 → Client Standard
INSERT INTO routing_rules (funnel_id, priority, condition, webhook_url, client_name, is_active) VALUES (
  'FUNNEL_ID_HERE',
  1,
  '{"field": "capital", "operator": "<=", "value": 50000}'::jsonb,
  'https://webhook.site/your-unique-url-2',
  'La Relève - Client Standard',
  true
);

-- Règle 3: Fallback (tous les autres)
INSERT INTO routing_rules (funnel_id, priority, condition, webhook_url, client_name, is_active) VALUES (
  'FUNNEL_ID_HERE',
  2,
  '{"field": "email", "operator": "contains", "value": "@"}'::jsonb,
  'https://webhook.site/your-unique-url-3',
  'Default Client',
  true
);

EOF

echo "---"
echo ""
echo "✅ Script SQL généré ci-dessus"
echo ""
echo "📝 Pour tester:"
echo "   1. Exécutez le SQL dans Supabase"
echo "   2. Remplacez FUNNEL_ID_HERE par l'ID retourné"
echo "   3. Remplacez les webhook URLs par vos vraies URLs (ou utilisez webhook.site pour tester)"
echo "   4. Allez sur http://localhost:3000/f/demo-flipimmo"
echo ""

