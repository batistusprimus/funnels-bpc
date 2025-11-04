# Guide des Webhooks - BPC Funnels

## Introduction

BPC Funnels route automatiquement vos leads vers vos clients via des webhooks HTTP. Ce guide explique comment configurer et tester vos webhooks.

## Format des Données Envoyées

### Payload JSON

Quand un lead est collecté, BPC Funnels envoie une requête POST à votre webhook avec ce format :

```json
{
  "firstName": "Jean",
  "email": "jean@exemple.fr",
  "phone": "0612345678",
  "capital": 75000,
  "goal": "Acheter mon premier bien",
  "utm": {
    "utm_source": "facebook",
    "utm_campaign": "test-campaign",
    "utm_medium": "cpc"
  },
  "timestamp": "2025-01-04T10:30:00Z",
  "funnel": "flipimmo-guide",
  "variant": "a",
  "lead_id": "550e8400-e29b-41d4-a716-446655440000"
}
```

### Headers HTTP

```
Content-Type: application/json
User-Agent: BPC-Funnels/1.0
X-Lead-ID: 550e8400-e29b-41d4-a716-446655440000
X-Funnel-Slug: flipimmo-guide
```

## Configuration des Webhooks

### 1. Dans le Dashboard

1. Aller dans un funnel
2. Cliquer sur **"Configuration du routage"**
3. Ajouter une règle :
   - **Condition** : définir quand envoyer (ex: capital > 50000)
   - **Webhook URL** : `https://votre-domaine.com/api/leads`
   - **Client** : nom du client destinataire

### 2. Règles de Routage Conditionnelles

Les leads sont envoyés au **premier webhook** dont la condition est vraie.

**Exemple** :

```
Règle 1 (priorité 0): Si capital > 50000
  → https://premium-client.com/webhook

Règle 2 (priorité 1): Si capital <= 50000
  → https://standard-client.com/webhook

Règle 3 (priorité 2): Si email contains "@"
  → https://fallback-client.com/webhook
```

### 3. Opérateurs Supportés

| Opérateur | Description | Exemple |
|-----------|-------------|---------|
| `==` | Égal à | `goal == "Acheter"` |
| `!=` | Différent de | `level != "Débutant"` |
| `>` | Supérieur à | `capital > 50000` |
| `>=` | Supérieur ou égal | `capital >= 50000` |
| `<` | Inférieur à | `age < 30` |
| `<=` | Inférieur ou égal | `age <= 30` |
| `contains` | Contient | `email contains "@gmail"` |
| `startsWith` | Commence par | `phone startsWith "06"` |
| `endsWith` | Se termine par | `email endsWith ".fr"` |

## Réception des Webhooks

### Endpoint côté client

Votre serveur doit exposer un endpoint POST qui accepte du JSON :

```javascript
// Exemple en Node.js/Express
app.post('/api/leads', async (req, res) => {
  try {
    const lead = req.body;
    
    // Valider les données
    if (!lead.email || !lead.firstName) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Traiter le lead (CRM, email, etc.)
    await processLead(lead);
    
    // Répondre avec succès
    res.status(200).json({ 
      success: true,
      message: 'Lead received'
    });
    
  } catch (error) {
    console.error('Error processing lead:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
```

### Réponse Attendue

BPC Funnels attend une réponse HTTP **200-299** pour considérer l'envoi comme réussi.

**Succès** :
```json
{
  "success": true,
  "message": "Lead received",
  "lead_id": "client-internal-id"
}
```

**Erreur** :
```json
{
  "error": "Duplicate lead",
  "code": "DUPLICATE"
}
```

## Tester vos Webhooks

### Méthode 1 : webhook.site (Recommandé pour tests)

1. Aller sur https://webhook.site
2. Copier l'URL unique générée
3. L'utiliser dans BPC Funnels
4. Soumettre un lead de test
5. Voir la requête apparaître en temps réel

### Méthode 2 : Script de test

```bash
./scripts/test-webhook.sh https://votre-webhook.com/api/leads
```

### Méthode 3 : Tunnel local (ngrok)

Pour tester un serveur local :

```bash
# Installer ngrok
brew install ngrok  # ou télécharger depuis ngrok.com

# Lancer votre serveur local sur port 8000
node server.js

# Créer un tunnel
ngrok http 8000

# Utiliser l'URL https://xxxxx.ngrok.io dans BPC Funnels
```

## Status des Leads

Dans BPC Funnels, chaque lead a un status :

- **pending** : En attente d'envoi
- **sent** : Envoyé avec succès (HTTP 200-299)
- **error** : Erreur lors de l'envoi
- **accepted** : Client a accepté le lead (via callback webhook - futur)
- **rejected** : Client a rejeté le lead (via callback webhook - futur)

## Retry Logic (Phase 2)

Actuellement : 1 seul essai d'envoi.

**Futur** : 
- 3 tentatives avec backoff exponentiel (1s, 5s, 15s)
- Dead letter queue pour leads non livrés
- Replay manuel depuis le dashboard

## Sécurité

### Validation HMAC (Phase 2)

Pour sécuriser vos webhooks :

```typescript
// BPC Funnels génère une signature
const signature = crypto
  .createHmac('sha256', SECRET_KEY)
  .update(JSON.stringify(payload))
  .digest('hex');

// Header envoyé
X-Signature: sha256=abc123...

// Votre serveur vérifie
const expectedSignature = crypto
  .createHmac('sha256', SECRET_KEY)
  .update(req.rawBody)
  .digest('hex');

if (signature !== expectedSignature) {
  return res.status(401).json({ error: 'Invalid signature' });
}
```

### IP Whitelisting

Pour restreindre l'accès à votre webhook :

```nginx
# Nginx
location /api/leads {
    allow 76.76.21.21;  # Vercel IP range
    deny all;
}
```

## Intégrations Populaires

### LeadProsper

```javascript
// Endpoint LeadProsper
POST https://api.leadprosper.io/v1/leads

// Mapper les champs BPC → LeadProsper
{
  "campaign_id": "your-campaign-id",
  "first_name": lead.firstName,
  "email": lead.email,
  "phone": lead.phone,
  "custom_fields": {
    "capital": lead.capital,
    "goal": lead.goal
  }
}
```

### Zapier

1. Créer un Zap
2. Trigger : **Webhooks by Zapier** → **Catch Hook**
3. Copier l'URL du webhook
4. Utiliser dans BPC Funnels
5. Tester et mapper les champs

### Make.com (Integromat)

1. Créer un scénario
2. Ajouter module **Webhooks** → **Custom webhook**
3. Copier l'URL
4. Utiliser dans BPC Funnels

## Logs et Debug

### Voir les logs d'envoi (futur)

```
Dashboard > Funnel > Webhooks > Logs

[2025-01-04 10:30:15] POST https://client.com/api/leads
├─ Request: { firstName: "Jean", ... }
├─ Response: 200 OK { success: true }
└─ Duration: 245ms
```

### Webhook Replay (futur)

En cas d'échec temporaire, possibilité de renvoyer manuellement :

```
Dashboard > Leads > Sélectionner > Actions > Resend to webhook
```

## FAQ

**Q: Mon webhook ne reçoit rien, que faire ?**
R: 
1. Vérifier que le funnel est "active"
2. Vérifier les règles de routage
3. Tester l'URL avec curl
4. Vérifier les logs côté serveur

**Q: Comment gérer les doublons ?**
R: Vérifier `lead.email` dans votre base avant insertion, ou utiliser le `lead_id` unique.

**Q: Puis-je envoyer vers plusieurs webhooks ?**
R: Oui, créez plusieurs règles avec des conditions différentes.

**Q: Comment sécuriser mon webhook ?**
R: Vérifiez l'IP source, utilisez HTTPS, et implémentez HMAC (phase 2).

---

**Besoin d'aide ?** Consultez le code source dans `src/lib/lead-router.ts`

