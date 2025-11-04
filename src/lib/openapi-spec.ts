/**
 * OpenAPI 3.0 Specification for BPC Funnels API v1
 */

export const openApiSpec = {
  openapi: '3.0.0',
  info: {
    title: 'BPC Funnels API',
    version: '1.0.0',
    description: `
API REST pour gérer les leads et webhooks de BPC Funnels.

## Authentification

Toutes les requêtes nécessitent une API key dans le header Authorization:

\`\`\`
Authorization: Bearer bpc_your_api_key_here
\`\`\`

## Rate Limiting

- 60 requêtes par minute par API key
- 1000 requêtes par heure par API key

Headers de réponse:
- \`X-RateLimit-Limit\`: Limite par minute
- \`X-RateLimit-Remaining\`: Requêtes restantes
- \`X-RateLimit-Reset\`: Timestamp du reset

## Scopes

- \`read:leads\`: Lire les leads
- \`write:leads\`: Créer des leads
- \`read:webhooks\`: Lire les logs et stats webhooks
- \`write:webhooks\`: Replay des webhooks
    `,
    contact: {
      name: 'Baptiste Piocelle - BPC CORP',
      email: 'support@bpcorp.fr',
    },
  },
  servers: [
    {
      url: 'http://localhost:3000',
      description: 'Développement',
    },
    {
      url: 'https://your-domain.com',
      description: 'Production',
    },
  ],
  components: {
    securitySchemes: {
      BearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'API Key',
        description: 'API key au format: bpc_xxxxx',
      },
    },
    schemas: {
      Lead: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            format: 'uuid',
            description: 'ID unique du lead',
          },
          funnel_id: {
            type: 'string',
            format: 'uuid',
            description: 'ID du funnel',
          },
          variant: {
            type: 'string',
            enum: ['a', 'b', 'c'],
            description: 'Variante A/B/C du funnel',
          },
          data: {
            type: 'object',
            description: 'Données du lead (firstName, email, phone, etc.)',
          },
          utm_params: {
            type: 'object',
            description: 'Paramètres UTM',
          },
          sent_to: {
            type: 'string',
            nullable: true,
            description: 'URL du webhook de destination',
          },
          sent_to_client: {
            type: 'string',
            nullable: true,
            description: 'Nom du client',
          },
          status: {
            type: 'string',
            enum: ['pending', 'sent', 'accepted', 'rejected', 'error'],
            description: 'Statut du lead',
          },
          error_message: {
            type: 'string',
            nullable: true,
          },
          sent_at: {
            type: 'string',
            format: 'date-time',
            nullable: true,
          },
          created_at: {
            type: 'string',
            format: 'date-time',
          },
        },
      },
      WebhookLog: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            format: 'uuid',
          },
          lead_id: {
            type: 'string',
            format: 'uuid',
          },
          routing_rule_id: {
            type: 'string',
            format: 'uuid',
          },
          webhook_url: {
            type: 'string',
            format: 'uri',
          },
          request_headers: {
            type: 'object',
          },
          request_body: {
            type: 'object',
          },
          response_status: {
            type: 'integer',
            nullable: true,
          },
          response_headers: {
            type: 'object',
            nullable: true,
          },
          response_body: {
            type: 'string',
            nullable: true,
          },
          duration_ms: {
            type: 'integer',
            nullable: true,
          },
          attempt_number: {
            type: 'integer',
          },
          max_attempts: {
            type: 'integer',
          },
          is_retry: {
            type: 'boolean',
          },
          parent_log_id: {
            type: 'string',
            format: 'uuid',
            nullable: true,
          },
          status: {
            type: 'string',
            enum: ['pending', 'success', 'failed', 'retrying'],
          },
          error_message: {
            type: 'string',
            nullable: true,
          },
          error_type: {
            type: 'string',
            enum: ['timeout', 'network', 'http_error', 'invalid_response'],
            nullable: true,
          },
          created_at: {
            type: 'string',
            format: 'date-time',
          },
        },
      },
      WebhookStats: {
        type: 'object',
        properties: {
          total_calls: {
            type: 'integer',
            description: 'Nombre total d\'appels',
          },
          success_calls: {
            type: 'integer',
            description: 'Nombre d\'appels réussis',
          },
          failed_calls: {
            type: 'integer',
            description: 'Nombre d\'appels échoués',
          },
          avg_duration_ms: {
            type: 'number',
            description: 'Durée moyenne en ms',
          },
          success_rate: {
            type: 'number',
            description: 'Taux de réussite en %',
          },
        },
      },
      Error: {
        type: 'object',
        properties: {
          error: {
            type: 'string',
            description: 'Message d\'erreur',
          },
          details: {
            type: 'string',
            description: 'Détails supplémentaires',
          },
        },
      },
      Pagination: {
        type: 'object',
        properties: {
          total: {
            type: 'integer',
          },
          limit: {
            type: 'integer',
          },
          offset: {
            type: 'integer',
          },
          has_more: {
            type: 'boolean',
          },
        },
      },
    },
  },
  security: [
    {
      BearerAuth: [],
    },
  ],
  paths: {
    '/api/v1/leads': {
      get: {
        summary: 'Liste des leads',
        description: 'Récupère la liste des leads avec pagination et filtres',
        tags: ['Leads'],
        parameters: [
          {
            name: 'limit',
            in: 'query',
            description: 'Nombre de résultats (max 100)',
            schema: {
              type: 'integer',
              default: 50,
              maximum: 100,
            },
          },
          {
            name: 'offset',
            in: 'query',
            description: 'Décalage pour la pagination',
            schema: {
              type: 'integer',
              default: 0,
            },
          },
          {
            name: 'status',
            in: 'query',
            description: 'Filtrer par statut',
            schema: {
              type: 'string',
              enum: ['pending', 'sent', 'accepted', 'rejected', 'error'],
            },
          },
          {
            name: 'funnel_id',
            in: 'query',
            description: 'Filtrer par funnel',
            schema: {
              type: 'string',
              format: 'uuid',
            },
          },
          {
            name: 'variant',
            in: 'query',
            description: 'Filtrer par variante',
            schema: {
              type: 'string',
              enum: ['a', 'b', 'c'],
            },
          },
        ],
        responses: {
          200: {
            description: 'Liste des leads',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    data: {
                      type: 'array',
                      items: {
                        $ref: '#/components/schemas/Lead',
                      },
                    },
                    pagination: {
                      $ref: '#/components/schemas/Pagination',
                    },
                  },
                },
              },
            },
          },
          401: {
            description: 'Non authentifié',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/Error',
                },
              },
            },
          },
          403: {
            description: 'Permissions insuffisantes',
          },
          429: {
            description: 'Rate limit dépassé',
          },
        },
      },
      post: {
        summary: 'Créer un lead',
        description: 'Crée un nouveau lead dans le système',
        tags: ['Leads'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['funnel_id', 'data'],
                properties: {
                  funnel_id: {
                    type: 'string',
                    format: 'uuid',
                    description: 'ID du funnel',
                  },
                  variant: {
                    type: 'string',
                    enum: ['a', 'b', 'c'],
                    default: 'a',
                  },
                  data: {
                    type: 'object',
                    description: 'Données du lead',
                    example: {
                      firstName: 'Jean',
                      email: 'jean@exemple.fr',
                      phone: '0612345678',
                    },
                  },
                  utm_params: {
                    type: 'object',
                    description: 'Paramètres UTM',
                  },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: 'Lead créé',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    data: {
                      $ref: '#/components/schemas/Lead',
                    },
                  },
                },
              },
            },
          },
          400: {
            description: 'Requête invalide',
          },
          401: {
            description: 'Non authentifié',
          },
          403: {
            description: 'Permissions insuffisantes',
          },
        },
      },
    },
    '/api/v1/leads/{id}': {
      get: {
        summary: 'Récupérer un lead',
        description: 'Récupère les détails d\'un lead par son ID',
        tags: ['Leads'],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            description: 'ID du lead',
            schema: {
              type: 'string',
              format: 'uuid',
            },
          },
        ],
        responses: {
          200: {
            description: 'Lead trouvé',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    data: {
                      $ref: '#/components/schemas/Lead',
                    },
                  },
                },
              },
            },
          },
          404: {
            description: 'Lead non trouvé',
          },
        },
      },
    },
    '/api/v1/webhooks/logs': {
      get: {
        summary: 'Logs des webhooks',
        description: 'Récupère les logs des appels webhook',
        tags: ['Webhooks'],
        parameters: [
          {
            name: 'routing_rule_id',
            in: 'query',
            required: true,
            description: 'ID de la règle de routage',
            schema: {
              type: 'string',
              format: 'uuid',
            },
          },
          {
            name: 'status',
            in: 'query',
            description: 'Filtrer par statut',
            schema: {
              type: 'string',
              enum: ['pending', 'success', 'failed', 'retrying'],
            },
          },
          {
            name: 'limit',
            in: 'query',
            schema: {
              type: 'integer',
              default: 50,
            },
          },
          {
            name: 'offset',
            in: 'query',
            schema: {
              type: 'integer',
              default: 0,
            },
          },
        ],
        responses: {
          200: {
            description: 'Logs récupérés',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    data: {
                      type: 'array',
                      items: {
                        $ref: '#/components/schemas/WebhookLog',
                      },
                    },
                    pagination: {
                      $ref: '#/components/schemas/Pagination',
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/api/v1/webhooks/stats': {
      get: {
        summary: 'Statistiques webhooks',
        description: 'Récupère les statistiques d\'un webhook',
        tags: ['Webhooks'],
        parameters: [
          {
            name: 'routing_rule_id',
            in: 'query',
            required: true,
            description: 'ID de la règle de routage',
            schema: {
              type: 'string',
              format: 'uuid',
            },
          },
          {
            name: 'days',
            in: 'query',
            description: 'Nombre de jours',
            schema: {
              type: 'integer',
              default: 7,
            },
          },
        ],
        responses: {
          200: {
            description: 'Statistiques récupérées',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    data: {
                      $ref: '#/components/schemas/WebhookStats',
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/api/v1/webhooks/replay/{id}': {
      post: {
        summary: 'Rejouer un webhook',
        description: 'Rejoue manuellement un appel webhook',
        tags: ['Webhooks'],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            description: 'ID du log webhook à rejouer',
            schema: {
              type: 'string',
              format: 'uuid',
            },
          },
        ],
        responses: {
          200: {
            description: 'Webhook rejoué',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    data: {
                      $ref: '#/components/schemas/WebhookLog',
                    },
                  },
                },
              },
            },
          },
          403: {
            description: 'Permissions insuffisantes',
          },
          404: {
            description: 'Log non trouvé',
          },
        },
      },
    },
  },
  tags: [
    {
      name: 'Leads',
      description: 'Gestion des leads',
    },
    {
      name: 'Webhooks',
      description: 'Gestion des webhooks et logs',
    },
  ],
};

