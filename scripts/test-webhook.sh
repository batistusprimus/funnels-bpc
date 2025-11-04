#!/bin/bash

# BPC Funnels - Test de Webhook
# Usage: ./scripts/test-webhook.sh <webhook-url>

WEBHOOK_URL=$1

if [ -z "$WEBHOOK_URL" ]; then
    echo "Usage: ./scripts/test-webhook.sh <webhook-url>"
    echo "Exemple: ./scripts/test-webhook.sh https://webhook.site/your-unique-url"
    exit 1
fi

echo "🧪 Test de webhook: $WEBHOOK_URL"
echo ""

# Données de test
TEST_DATA='{
  "firstName": "Jean",
  "email": "jean.test@exemple.fr",
  "phone": "0612345678",
  "capital": 75000,
  "goal": "Acheter mon premier bien",
  "utm": {
    "utm_source": "facebook",
    "utm_campaign": "test"
  },
  "timestamp": "'$(date -u +%Y-%m-%dT%H:%M:%SZ)'",
  "funnel": "demo-flipimmo",
  "variant": "a",
  "lead_id": "test-'$(uuidgen)'"
}'

echo "📤 Envoi des données de test..."
echo ""

# Envoyer la requête
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$WEBHOOK_URL" \
  -H "Content-Type: application/json" \
  -d "$TEST_DATA")

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | head -n-1)

echo "HTTP Status: $HTTP_CODE"
echo ""

if [ "$HTTP_CODE" -ge 200 ] && [ "$HTTP_CODE" -lt 300 ]; then
    echo "✅ Webhook OK!"
    echo ""
    echo "Réponse:"
    echo "$BODY" | jq '.' 2>/dev/null || echo "$BODY"
else
    echo "❌ Webhook en erreur"
    echo ""
    echo "Réponse:"
    echo "$BODY"
fi

echo ""

