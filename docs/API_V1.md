# API REST v1 - BPC Funnels

Documentation complète de l'API REST v1 pour gérer les leads et webhooks.

## 🚀 Démarrage Rapide

### 1. Créer une API Key

Depuis le code (à intégrer dans une page d'admin):

```typescript
import { createApiKey } from '@/lib/api-auth';

const { api_key, key } = await createApiKey(
  'Mon App',
  'API key pour mon intégration',
  ['read:leads', 'write:leads', 'read:webhooks'],
  {
    rate_limit_per_minute: 60,
    rate_limit_per_hour: 1000,
  }
);

console.log('API Key:', key); // Sauvegarder cette clé !
```

⚠️ **Important**: La clé complète n'est affichée qu'une seule fois. Conservez-la en sécurité.

### 2. Faire votre première requête

```bash
curl -X GET 'https://your-domain.com/api/v1/leads?limit=10' \
  -H 'Authorization: Bearer bpc_your_api_key_here'
```

## 📖 Documentation Interactive

Accédez à la documentation Swagger UI:

```
http://localhost:3000/api-docs
```

## 🔐 Authentification

Toutes les requêtes nécessitent un header `Authorization`:

```
Authorization: Bearer bpc_xxxxxxxxxxxxx
```

Format de l'API key: `bpc_` suivi de 64 caractères hexadécimaux.

### Scopes (Permissions)

| Scope | Description |
|-------|-------------|
| `read:leads` | Lire les leads |
| `write:leads` | Créer des leads |
| `read:webhooks` | Consulter les logs et stats webhooks |
| `write:webhooks` | Rejouer des webhooks |
| `*` | Tous les accès |

## ⚡ Rate Limiting

Limites par défaut:
- **60 requêtes/minute** par API key
- **1000 requêtes/heure** par API key

Headers de réponse:
```
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 45
X-RateLimit-Reset: 2025-01-05T10:30:00Z
```

En cas de dépassement (HTTP 429):
```json
{
  "error": "Rate limit exceeded"
}
```

Header supplémentaire:
```
Retry-After: 30
```

## 📊 Endpoints

### Leads

#### GET /api/v1/leads

Récupère la liste des leads.

**Paramètres query:**
- `limit` (integer): Nombre de résultats (défaut: 50, max: 100)
- `offset` (integer): Décalage pour pagination (défaut: 0)
- `status` (string): Filtrer par statut (`pending`, `sent`, `error`)
- `funnel_id` (uuid): Filtrer par funnel
- `variant` (string): Filtrer par variante (`a`, `b`, `c`)

**Exemple:**
```bash
curl -X GET 'https://your-domain.com/api/v1/leads?limit=10&status=sent' \
  -H 'Authorization: Bearer bpc_xxxxx'
```

**Réponse 200:**
```json
{
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "funnel_id": "123e4567-e89b-12d3-a456-426614174000",
      "variant": "a",
      "data": {
        "firstName": "Jean",
        "email": "jean@exemple.fr",
        "phone": "0612345678"
      },
      "utm_params": {
        "utm_source": "facebook"
      },
      "status": "sent",
      "created_at": "2025-01-05T10:00:00Z"
    }
  ],
  "pagination": {
    "total": 150,
    "limit": 10,
    "offset": 0,
    "has_more": true
  }
}
```

#### POST /api/v1/leads

Crée un nouveau lead.

**Body:**
```json
{
  "funnel_id": "123e4567-e89b-12d3-a456-426614174000",
  "variant": "a",
  "data": {
    "firstName": "Marie",
    "email": "marie@exemple.fr",
    "phone": "0687654321"
  },
  "utm_params": {
    "utm_source": "google",
    "utm_campaign": "brand"
  }
}
```

**Réponse 201:**
```json
{
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "funnel_id": "123e4567-e89b-12d3-a456-426614174000",
    "variant": "a",
    "data": { ... },
    "status": "pending",
    "created_at": "2025-01-05T10:05:00Z"
  }
}
```

#### GET /api/v1/leads/:id

Récupère un lead par son ID.

**Exemple:**
```bash
curl -X GET 'https://your-domain.com/api/v1/leads/550e8400-e29b-41d4-a716-446655440000' \
  -H 'Authorization: Bearer bpc_xxxxx'
```

**Réponse 200:**
```json
{
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "funnel_id": "123e4567-e89b-12d3-a456-426614174000",
    ...
  }
}
```

### Webhooks

#### GET /api/v1/webhooks/logs

Récupère les logs des appels webhook.

**Paramètres query:**
- `routing_rule_id` (uuid, **requis**): ID de la règle de routage
- `status` (string): Filtrer par statut (`pending`, `success`, `failed`, `retrying`)
- `limit` (integer): Nombre de résultats (défaut: 50)
- `offset` (integer): Décalage (défaut: 0)

**Exemple:**
```bash
curl -X GET 'https://your-domain.com/api/v1/webhooks/logs?routing_rule_id=abc123&status=failed' \
  -H 'Authorization: Bearer bpc_xxxxx'
```

**Réponse 200:**
```json
{
  "data": [
    {
      "id": "log-uuid",
      "lead_id": "lead-uuid",
      "webhook_url": "https://client.com/api/leads",
      "request_body": { ... },
      "response_status": 500,
      "response_body": "Internal Server Error",
      "duration_ms": 245,
      "attempt_number": 1,
      "max_attempts": 3,
      "status": "failed",
      "error_message": "HTTP 500: Internal Server Error",
      "error_type": "http_error",
      "created_at": "2025-01-05T10:00:00Z"
    }
  ],
  "pagination": { ... }
}
```

#### GET /api/v1/webhooks/stats

Récupère les statistiques d'un webhook.

**Paramètres query:**
- `routing_rule_id` (uuid, **requis**)
- `days` (integer): Nombre de jours (défaut: 7)

**Exemple:**
```bash
curl -X GET 'https://your-domain.com/api/v1/webhooks/stats?routing_rule_id=abc123&days=30' \
  -H 'Authorization: Bearer bpc_xxxxx'
```

**Réponse 200:**
```json
{
  "data": {
    "total_calls": 1250,
    "success_calls": 1180,
    "failed_calls": 70,
    "avg_duration_ms": 234.5,
    "success_rate": 94.4
  }
}
```

#### POST /api/v1/webhooks/replay/:id

Rejoue manuellement un webhook.

**Exemple:**
```bash
curl -X POST 'https://your-domain.com/api/v1/webhooks/replay/log-uuid' \
  -H 'Authorization: Bearer bpc_xxxxx'
```

**Réponse 200:**
```json
{
  "data": {
    "id": "new-log-uuid",
    "parent_log_id": "log-uuid",
    "is_retry": true,
    "attempt_number": 2,
    "status": "success",
    ...
  }
}
```

## 🔄 Webhook Queue Processing

Pour traiter la queue des webhooks (retry automatique), configurer un cron job:

```bash
# Cron job toutes les minutes
* * * * * curl -X POST 'https://your-domain.com/api/v1/webhooks/process-queue' \
  -H 'Authorization: Bearer YOUR_CRON_SECRET'
```

Définir `CRON_SECRET` dans `.env`:
```env
CRON_SECRET=your-secure-cron-secret-here
```

### Avec Vercel Cron

Dans `vercel.json`:
```json
{
  "crons": [
    {
      "path": "/api/v1/webhooks/process-queue",
      "schedule": "* * * * *"
    }
  ]
}
```

## 🛠 Codes d'Erreur

| Code | Description |
|------|-------------|
| 400 | Requête invalide (paramètres manquants ou incorrects) |
| 401 | Non authentifié (API key invalide ou expirée) |
| 403 | Permissions insuffisantes (scope manquant) |
| 404 | Ressource non trouvée |
| 429 | Rate limit dépassé |
| 500 | Erreur serveur |

Format des erreurs:
```json
{
  "error": "Message d'erreur",
  "details": "Détails supplémentaires (optionnel)"
}
```

## 💡 Exemples d'Intégration

### Node.js

```javascript
const API_KEY = 'bpc_xxxxx';
const BASE_URL = 'https://your-domain.com/api/v1';

async function getLeads() {
  const response = await fetch(`${BASE_URL}/leads?limit=50`, {
    headers: {
      'Authorization': `Bearer ${API_KEY}`,
    },
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error);
  }
  
  const data = await response.json();
  return data.data;
}

async function createLead(leadData) {
  const response = await fetch(`${BASE_URL}/leads`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(leadData),
  });
  
  if (!response.ok) {
    throw new Error('Failed to create lead');
  }
  
  return await response.json();
}
```

### Python

```python
import requests

API_KEY = 'bpc_xxxxx'
BASE_URL = 'https://your-domain.com/api/v1'

headers = {
    'Authorization': f'Bearer {API_KEY}',
    'Content-Type': 'application/json'
}

# Récupérer les leads
response = requests.get(f'{BASE_URL}/leads?limit=50', headers=headers)
leads = response.json()['data']

# Créer un lead
lead_data = {
    'funnel_id': '123e4567-e89b-12d3-a456-426614174000',
    'variant': 'a',
    'data': {
        'firstName': 'Pierre',
        'email': 'pierre@exemple.fr'
    }
}
response = requests.post(f'{BASE_URL}/leads', json=lead_data, headers=headers)
new_lead = response.json()['data']
```

## 🔒 Sécurité

### Bonnes Pratiques

1. **Ne jamais exposer l'API key côté client** (frontend)
2. **Utiliser HTTPS** en production
3. **Stocker les API keys dans des variables d'environnement**
4. **Définir des scopes minimaux** (principe du moindre privilège)
5. **Configurer une date d'expiration** pour les clés temporaires
6. **Monitorer l'utilisation** via les logs `api_rate_limit_log`

### Révoquer une API Key

```sql
-- Désactiver une clé
UPDATE api_keys 
SET is_active = false 
WHERE key_preview = 'bpc_abc123...xyz789';

-- Supprimer une clé
DELETE FROM api_keys 
WHERE key_preview = 'bpc_abc123...xyz789';
```

## 📈 Monitoring

### Vérifier l'usage d'une API key

```sql
SELECT 
  name,
  total_requests,
  last_used_at,
  created_at
FROM api_keys
WHERE is_active = true
ORDER BY last_used_at DESC;
```

### Logs de rate limiting

```sql
SELECT 
  ak.name,
  COUNT(*) as requests,
  DATE_TRUNC('hour', arl.created_at) as hour
FROM api_rate_limit_log arl
JOIN api_keys ak ON ak.id = arl.api_key_id
WHERE arl.created_at > NOW() - INTERVAL '24 hours'
GROUP BY ak.name, hour
ORDER BY hour DESC;
```

## 🆘 Support

Pour toute question ou problème:
- Documentation Swagger: `/api-docs`
- Email: support@bpcorp.fr
- GitHub Issues: [lien vers repo]

---

**Version:** 1.0.0  
**Dernière mise à jour:** 5 janvier 2025

