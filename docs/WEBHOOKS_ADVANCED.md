# Système de Webhooks Avancé - BPC Funnels

Documentation complète du système de webhooks avec retry logic, logs détaillés, et replay manuel.

## 🎯 Fonctionnalités

- ✅ **Retry automatique** avec backoff exponentiel
- ✅ **Custom headers** HTTP personnalisés
- ✅ **Logs détaillés** de tous les appels
- ✅ **Replay manuel** depuis le dashboard
- ✅ **Statistiques temps réel** (taux de succès, durée moyenne)
- ✅ **Queue persistante** pour les webhooks échoués
- ✅ **Timeout configurable** par webhook
- ✅ **Monitoring** via dashboard

## 🚀 Configuration

### 1. Migration de la Base de Données

Exécuter la migration pour créer les tables nécessaires:

```bash
# Avec Supabase CLI
supabase db push

# Ou manuellement
psql -d your_database < supabase/migrations/20250105_webhooks_advanced.sql
```

### Tables créées:
- `webhook_configs` - Configuration des webhooks
- `webhook_logs` - Logs détaillés de chaque appel
- `webhook_queue` - Queue pour retry automatique
- `api_keys` - Clés API pour l'API REST
- `api_rate_limit_log` - Logs de rate limiting

### 2. Variables d'Environnement

Ajouter dans `.env.local`:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
SUPABASE_SERVICE_KEY=eyJxxx...

# Cron secret pour process-queue
CRON_SECRET=your-secure-random-string
```

## 📝 Utilisation

### Configuration via Dashboard

1. Aller dans un funnel
2. Cliquer sur l'onglet **"Webhooks"**
3. Sélectionner une règle de routage
4. Configurer:
   - **Retry Logic**: Activer/désactiver, nombre de tentatives
   - **Custom Headers**: Ajouter des headers HTTP personnalisés
   - **Timeout**: Délai max avant timeout
   - **Backoff**: Multiplicateur pour le délai entre retries

### Configuration Programmatique

```typescript
import { getWebhookManager } from '@/lib/webhook-manager';

const webhookManager = getWebhookManager();

// Mettre à jour la config
await webhookManager.updateWebhookConfig('routing-rule-id', {
  custom_headers: {
    'X-API-Key': 'secret-key',
    'X-Client-ID': 'client-123',
  },
  timeout_ms: 15000,
  retry_enabled: true,
  max_retries: 5,
  retry_delay_ms: 2000,
  retry_backoff_multiplier: 2.5,
});
```

## 🔄 Retry Logic

### Fonctionnement

Quand un webhook échoue (timeout, erreur réseau, HTTP 4xx/5xx):

1. Le log est créé avec `status = 'failed'`
2. Si retry activé et tentatives < max, ajout à la queue
3. Le cron job traite la queue toutes les minutes
4. Chaque retry utilise un **backoff exponentiel**

### Exemple de Délais

Configuration:
- `retry_delay_ms = 1000` (1 seconde)
- `retry_backoff_multiplier = 2.0`
- `max_retries = 3`

Séquence:
```
Tentative 1: Immédiate (échec)
  ↓ attendre 1s
Tentative 2: +1s (échec)
  ↓ attendre 2s
Tentative 3: +2s (échec)
  ↓ attendre 4s
Tentative 4: +4s (dernier essai)
```

### Désactiver le Retry

Pour un webhook spécifique:

```typescript
await webhookManager.updateWebhookConfig('routing-rule-id', {
  retry_enabled: false,
});
```

## 📊 Logs Détaillés

### Structure d'un Log

```typescript
{
  id: "uuid",
  lead_id: "uuid",
  routing_rule_id: "uuid",
  webhook_url: "https://client.com/api/leads",
  
  // Request
  request_headers: {
    "Content-Type": "application/json",
    "X-Custom-Header": "value"
  },
  request_body: { ... },
  
  // Response
  response_status: 200,
  response_headers: { ... },
  response_body: "{ \"success\": true }",
  
  // Timing
  duration_ms: 234,
  
  // Retry info
  attempt_number: 1,
  max_attempts: 3,
  is_retry: false,
  parent_log_id: null,
  
  // Status
  status: "success", // pending, success, failed, retrying
  error_message: null,
  error_type: null, // timeout, network, http_error
  
  created_at: "2025-01-05T10:00:00Z"
}
```

### Types d'Erreurs

| Type | Description | Exemple |
|------|-------------|---------|
| `timeout` | Timeout dépassé | Request timeout after 10000ms |
| `network` | Erreur réseau/DNS | Failed to fetch, Connection refused |
| `http_error` | Code HTTP d'erreur | HTTP 500: Internal Server Error |
| `invalid_response` | Réponse invalide | Non utilisé actuellement |

### Consulter les Logs

#### Via Dashboard

1. Funnel > Webhooks > Onglet "Logs"
2. Filtrer par statut: Succès, Échec, Retry
3. Voir les détails: request, response, durée
4. Action: **Rejouer** un webhook

#### Via API

```bash
curl -X GET 'https://your-domain.com/api/v1/webhooks/logs?routing_rule_id=xxx' \
  -H 'Authorization: Bearer bpc_xxxxx'
```

#### Via SQL

```sql
-- Logs des dernières 24h
SELECT 
  wl.*,
  l.data->>'email' as lead_email,
  rr.client_name
FROM webhook_logs wl
JOIN leads l ON l.id = wl.lead_id
JOIN routing_rules rr ON rr.id = wl.routing_rule_id
WHERE wl.created_at > NOW() - INTERVAL '24 hours'
ORDER BY wl.created_at DESC;
```

## 📈 Statistiques

### Via Dashboard

Stats affichées en temps réel:
- **Total d'appels**
- **Taux de succès**
- **Nombre d'échecs**
- **Durée moyenne**

Filtre: 7 derniers jours (par défaut)

### Via API

```bash
curl -X GET 'https://your-domain.com/api/v1/webhooks/stats?routing_rule_id=xxx&days=30' \
  -H 'Authorization: Bearer bpc_xxxxx'
```

### Via SQL

Utiliser la fonction PostgreSQL:

```sql
SELECT * FROM get_webhook_stats(
  'routing-rule-id'::uuid,
  30  -- derniers 30 jours
);
```

Résultat:
```
total_calls | success_calls | failed_calls | avg_duration_ms | success_rate
------------|---------------|--------------|-----------------|-------------
    1250    |     1180      |      70      |     234.50      |    94.40
```

## 🔁 Replay Manuel

### Via Dashboard

1. Funnel > Webhooks > Logs
2. Trouver le log à rejouer
3. Cliquer sur **"Rejouer"**
4. Un nouveau log est créé avec `is_retry = true`

### Via API

```bash
curl -X POST 'https://your-domain.com/api/v1/webhooks/replay/log-uuid' \
  -H 'Authorization: Bearer bpc_xxxxx'
```

### Programmatique

```typescript
const webhookManager = getWebhookManager();
const newLog = await webhookManager.replayWebhook('log-uuid');

console.log('Status:', newLog.status);
console.log('Response:', newLog.response_status);
```

## 🎨 Custom Headers

### Cas d'Usage

- **Authentification**: `Authorization: Bearer token`
- **API Keys**: `X-API-Key: secret`
- **Identification**: `X-Client-ID: client-123`
- **Versioning**: `X-API-Version: v2`
- **Tracking**: `X-Request-ID: unique-id`

### Configuration

Via Dashboard:
1. Webhooks > Configuration
2. Section "Custom Headers"
3. Ajouter: Nom + Valeur
4. Sauvegarder

Via API:

```typescript
await webhookManager.updateWebhookConfig('routing-rule-id', {
  custom_headers: {
    'Authorization': 'Bearer sk-test-123',
    'X-API-Key': 'my-secret-key',
    'X-Webhook-Source': 'BPC-Funnels',
  },
});
```

### Headers Automatiques

Headers ajoutés automatiquement à tous les webhooks:

```
Content-Type: application/json
User-Agent: BPC-Funnels/2.0
X-Lead-ID: {lead_id}
X-Funnel-Webhook: true
```

## ⏰ Queue Processing (Cron)

### Configuration

#### Vercel Cron

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

#### Cron Unix

```bash
# Ajouter dans crontab -e
* * * * * curl -X POST 'https://your-domain.com/api/v1/webhooks/process-queue' \
  -H 'Authorization: Bearer YOUR_CRON_SECRET' \
  >> /var/log/webhook-queue.log 2>&1
```

#### Avec GitHub Actions

`.github/workflows/webhook-queue.yml`:

```yaml
name: Process Webhook Queue

on:
  schedule:
    - cron: '* * * * *'  # Chaque minute

jobs:
  process:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger webhook queue
        run: |
          curl -X POST '${{ secrets.APP_URL }}/api/v1/webhooks/process-queue' \
            -H 'Authorization: Bearer ${{ secrets.CRON_SECRET }}'
```

### Monitoring

Vérifier les webhooks en queue:

```sql
SELECT 
  wq.id,
  wq.status,
  wq.attempt_number,
  wq.scheduled_at,
  l.data->>'email' as lead_email,
  rr.client_name
FROM webhook_queue wq
JOIN leads l ON l.id = wq.lead_id
JOIN routing_rules rr ON rr.id = wq.routing_rule_id
WHERE wq.status = 'pending'
ORDER BY wq.scheduled_at;
```

## 🛠 Dépannage

### Webhook ne s'envoie pas

1. Vérifier que la règle de routage est `is_active = true`
2. Vérifier que le funnel est `status = 'active'`
3. Vérifier la condition de routage
4. Consulter les logs d'erreur

### Retry ne fonctionne pas

1. Vérifier `retry_enabled = true` dans la config
2. Vérifier que le cron job est configuré
3. Vérifier la table `webhook_queue`
4. Vérifier les logs du cron: `/var/log/webhook-queue.log`

### Timeout trop court

Augmenter le timeout:

```typescript
await webhookManager.updateWebhookConfig('routing-rule-id', {
  timeout_ms: 30000, // 30 secondes
});
```

### Trop de retries

Réduire le nombre:

```typescript
await webhookManager.updateWebhookConfig('routing-rule-id', {
  max_retries: 1, // Seulement 1 retry
});
```

## 📊 Schéma de Base de Données

```
webhook_configs
├─ id (uuid, PK)
├─ routing_rule_id (uuid, FK → routing_rules)
├─ custom_headers (jsonb)
├─ timeout_ms (integer)
├─ retry_enabled (boolean)
├─ max_retries (integer)
├─ retry_delay_ms (integer)
└─ retry_backoff_multiplier (decimal)

webhook_logs
├─ id (uuid, PK)
├─ lead_id (uuid, FK → leads)
├─ routing_rule_id (uuid, FK → routing_rules)
├─ webhook_url (text)
├─ request_headers (jsonb)
├─ request_body (jsonb)
├─ response_status (integer)
├─ response_headers (jsonb)
├─ response_body (text)
├─ duration_ms (integer)
├─ attempt_number (integer)
├─ max_attempts (integer)
├─ is_retry (boolean)
├─ parent_log_id (uuid, FK → webhook_logs)
├─ status (enum: pending, success, failed, retrying)
├─ error_message (text)
├─ error_type (enum: timeout, network, http_error, invalid_response)
└─ created_at (timestamp)

webhook_queue
├─ id (uuid, PK)
├─ lead_id (uuid, FK → leads)
├─ routing_rule_id (uuid, FK → routing_rules)
├─ webhook_log_id (uuid, FK → webhook_logs)
├─ status (enum: pending, processing, completed, failed)
├─ priority (integer)
├─ attempt_number (integer)
├─ max_attempts (integer)
├─ scheduled_at (timestamp)
├─ started_at (timestamp)
├─ completed_at (timestamp)
└─ error_message (text)
```

## 🔐 Sécurité

### HTTPS Obligatoire

Toujours utiliser HTTPS en production pour les webhooks.

### Validation côté Client

Le serveur qui reçoit les webhooks doit:

1. **Vérifier l'IP source** (whitelist Vercel)
2. **Valider le payload** (schéma JSON)
3. **Vérifier les headers** (X-Lead-ID, User-Agent)

### HMAC Signature (Futur)

Prévu pour v2.0:

```typescript
// BPC Funnels générera une signature
const signature = crypto
  .createHmac('sha256', SECRET)
  .update(JSON.stringify(payload))
  .digest('hex');

// Header: X-Signature: sha256=abc123...
```

## 📚 Ressources

- [API REST v1](./API_V1.md)
- [Guide des Webhooks de Base](./WEBHOOKS.md)
- [Architecture du Système](./ARCHITECTURE.md)

---

**Version:** 2.0.0  
**Dernière mise à jour:** 5 janvier 2025

