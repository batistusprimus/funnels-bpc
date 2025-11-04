-- ============================================
-- BPC FUNNELS - Seed Templates
-- ============================================

INSERT INTO templates (name, description, category, tags, config) VALUES
(
  'Landing Simple Immobilier',
  'Template parfait pour collecter des leads dans l''immobilier avec un formulaire simple',
  'Immobilier',
  ARRAY['immobilier', 'lead-magnet', 'simple'],
  '{
    "tracking": {},
    "variants": [
      {
        "key": "a",
        "weight": 100,
        "landing": {
          "title": "Téléchargez Votre Guide Gratuit",
          "subtitle": "Découvrez les secrets de l''investissement immobilier rentable",
          "cta": {
            "text": "Je télécharge le guide",
            "href": "/form"
          },
          "theme": {
            "primaryColor": "#2563eb",
            "backgroundColor": "#ffffff"
          }
        },
        "steps": [
          {
            "id": "step-1",
            "title": "Vos coordonnées",
            "subtitle": "Recevez immédiatement votre guide par email",
            "fields": [
              {
                "type": "text",
                "name": "prenom",
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
                "name": "telephone",
                "label": "Téléphone",
                "placeholder": "06 12 34 56 78",
                "required": true
              }
            ],
            "nextStep": null
          }
        ],
        "thankYou": {
          "title": "Merci !",
          "message": "Votre guide a été envoyé par email",
          "cta": null
        }
      }
    ]
  }'::jsonb
),
(
  'Quiz Formation',
  'Template de quiz interactif pour qualifier les leads intéressés par une formation',
  'Formation',
  ARRAY['formation', 'quiz', 'qualification'],
  '{
    "tracking": {},
    "variants": [
      {
        "key": "a",
        "weight": 100,
        "landing": {
          "title": "Quelle Formation Vous Correspond ?",
          "subtitle": "Répondez à 3 questions pour découvrir votre parcours idéal",
          "cta": {
            "text": "Commencer le quiz",
            "href": "/form"
          },
          "theme": {
            "primaryColor": "#7c3aed",
            "backgroundColor": "#ffffff"
          }
        },
        "steps": [
          {
            "id": "step-1",
            "title": "Question 1/3",
            "subtitle": "Quel est votre niveau d''expérience ?",
            "fields": [
              {
                "type": "radio",
                "name": "niveau",
                "label": "Niveau d''expérience",
                "required": true,
                "options": ["Débutant", "Intermédiaire", "Avancé"]
              }
            ],
            "nextStep": "step-2"
          },
          {
            "id": "step-2",
            "title": "Question 2/3",
            "subtitle": "Quel est votre objectif principal ?",
            "fields": [
              {
                "type": "radio",
                "name": "objectif",
                "label": "Objectif",
                "required": true,
                "options": ["Reconversion", "Montée en compétences", "Créer mon entreprise"]
              }
            ],
            "nextStep": "step-3"
          },
          {
            "id": "step-3",
            "title": "Question 3/3",
            "subtitle": "Comment pouvons-nous vous contacter ?",
            "fields": [
              {
                "type": "text",
                "name": "prenom",
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
                "name": "telephone",
                "label": "Téléphone",
                "placeholder": "06 12 34 56 78",
                "required": true
              }
            ],
            "nextStep": null
          }
        ],
        "thankYou": {
          "title": "Résultats envoyés !",
          "message": "Nous vous enverrons votre parcours personnalisé par email",
          "cta": null
        }
      }
    ]
  }'::jsonb
),
(
  'Lead Magnet Services',
  'Template classique pour une offre de service avec formulaire de contact',
  'Services',
  ARRAY['services', 'b2b', 'contact'],
  '{
    "tracking": {},
    "variants": [
      {
        "key": "a",
        "weight": 100,
        "landing": {
          "title": "Boostez Votre Activité",
          "subtitle": "Recevez une consultation gratuite et un devis personnalisé",
          "cta": {
            "text": "Demander mon devis",
            "href": "/form"
          },
          "theme": {
            "primaryColor": "#059669",
            "backgroundColor": "#ffffff"
          }
        },
        "steps": [
          {
            "id": "step-1",
            "title": "Parlez-nous de votre projet",
            "subtitle": "Nous reviendrons vers vous sous 24h",
            "fields": [
              {
                "type": "text",
                "name": "entreprise",
                "label": "Nom de l''entreprise",
                "placeholder": "ACME Corp",
                "required": true
              },
              {
                "type": "text",
                "name": "nom",
                "label": "Votre nom",
                "placeholder": "Jean Dupont",
                "required": true
              },
              {
                "type": "email",
                "name": "email",
                "label": "Email professionnel",
                "placeholder": "jean@acme.fr",
                "required": true
              },
              {
                "type": "tel",
                "name": "telephone",
                "label": "Téléphone",
                "placeholder": "06 12 34 56 78",
                "required": true
              },
              {
                "type": "textarea",
                "name": "message",
                "label": "Décrivez votre besoin",
                "placeholder": "Je souhaiterais...",
                "required": false
              }
            ],
            "nextStep": null
          }
        ],
        "thankYou": {
          "title": "Demande reçue !",
          "message": "Notre équipe va étudier votre projet et vous recontacter rapidement",
          "cta": null
        }
      }
    ]
  }'::jsonb
);

