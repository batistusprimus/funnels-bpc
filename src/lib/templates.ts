import type { FunnelConfig } from '@/types';

// Template : Landing Simple
export const simpleTemplate: FunnelConfig = {
  variants: [
    {
      key: 'a',
      weight: 100,
      landing: {
        title: 'Titre accrocheur pour votre offre',
        subtitle: 'Sous-titre explicatif qui détaille votre proposition de valeur',
        cta: {
          text: 'Démarrer maintenant',
          href: '/form',
        },
      },
      steps: [
        {
          id: 'optin',
          title: 'Vos coordonnées',
          subtitle: 'Remplissez ce formulaire pour commencer',
          fields: [
            {
              type: 'text',
              name: 'firstName',
              label: 'Prénom',
              placeholder: 'Jean',
              required: true,
            },
            {
              type: 'email',
              name: 'email',
              label: 'Adresse email',
              placeholder: 'jean@exemple.fr',
              required: true,
            },
            {
              type: 'tel',
              name: 'phone',
              label: 'Téléphone',
              placeholder: '06 12 34 56 78',
              required: false,
            },
          ],
          nextStep: null,
        },
      ],
      thankYou: {
        title: 'Merci pour votre inscription !',
        message: 'Nous reviendrons vers vous rapidement avec plus d\'informations.',
      },
    },
  ],
};

// Template : Quiz Multi-Étapes
export const quizTemplate: FunnelConfig = {
  variants: [
    {
      key: 'a',
      weight: 100,
      landing: {
        title: 'Répondez à 3 questions',
        subtitle: 'Obtenez votre solution personnalisée en quelques secondes',
        cta: {
          text: 'Commencer le quiz',
          href: '/form',
        },
      },
      steps: [
        {
          id: 'q1',
          title: 'Question 1',
          subtitle: 'Quel est votre niveau actuel ?',
          fields: [
            {
              type: 'radio',
              name: 'level',
              label: 'Vous êtes...',
              required: true,
              options: ['Débutant complet', 'J\'ai quelques connaissances', 'Déjà expérimenté'],
            },
          ],
          nextStep: 'q2',
        },
        {
          id: 'q2',
          title: 'Question 2',
          subtitle: 'Quel est votre budget disponible ?',
          fields: [
            {
              type: 'number',
              name: 'budget',
              label: 'Budget (€)',
              placeholder: '10000',
              required: true,
              min: 0,
            },
          ],
          nextStep: 'optin',
        },
        {
          id: 'optin',
          title: 'Recevez votre résultat personnalisé',
          subtitle: 'Entrez votre email pour recevoir votre solution',
          fields: [
            {
              type: 'text',
              name: 'firstName',
              label: 'Prénom',
              placeholder: 'Jean',
              required: true,
            },
            {
              type: 'email',
              name: 'email',
              label: 'Email',
              placeholder: 'jean@exemple.fr',
              required: true,
            },
          ],
          nextStep: null,
        },
      ],
      thankYou: {
        title: 'Merci ! Consultez votre email',
        message: 'Votre solution personnalisée vous attend dans votre boîte mail.',
      },
    },
  ],
};

// Template : Storytelling (longue landing)
export const storytellingTemplate: FunnelConfig = {
  variants: [
    {
      key: 'a',
      weight: 100,
      landing: {
        title: 'Découvrez la méthode qui a transformé plus de 1000 personnes',
        subtitle: 'Une approche éprouvée, pas à pas, pour atteindre vos objectifs en 90 jours',
        cta: {
          text: 'Accéder au guide gratuit',
          href: '/form',
        },
      },
      steps: [
        {
          id: 'optin',
          title: 'Recevez votre guide gratuit',
          subtitle: 'Entrez vos coordonnées pour accéder immédiatement au contenu',
          fields: [
            {
              type: 'text',
              name: 'firstName',
              label: 'Prénom',
              placeholder: 'Jean',
              required: true,
            },
            {
              type: 'email',
              name: 'email',
              label: 'Email',
              placeholder: 'jean@exemple.fr',
              required: true,
            },
          ],
          nextStep: 'profil',
        },
        {
          id: 'profil',
          title: 'Parlez-nous de votre situation',
          subtitle: 'Pour personnaliser votre expérience',
          fields: [
            {
              type: 'select',
              name: 'objective',
              label: 'Votre objectif principal',
              required: true,
              options: [
                'Apprendre les bases',
                'Développer mes compétences',
                'Passer à l\'action rapidement',
                'Optimiser mes résultats',
              ],
            },
            {
              type: 'number',
              name: 'budget',
              label: 'Budget disponible (€)',
              placeholder: '5000',
              required: false,
              min: 0,
            },
          ],
          nextStep: null,
        },
      ],
      thankYou: {
        title: 'Parfait ! Votre guide arrive dans quelques instants',
        message: 'Consultez votre boîte mail (et vos spams) pour accéder au contenu.',
        cta: {
          text: 'Réserver un appel gratuit',
          href: 'https://calendly.com/votre-lien',
        },
      },
    },
  ],
};

// Template vierge
export const blankTemplate: FunnelConfig = {
  variants: [
    {
      key: 'a',
      weight: 100,
      landing: {
        title: 'Votre titre ici',
        subtitle: 'Votre sous-titre ici',
        cta: {
          text: 'Commencer',
          href: '/form',
        },
      },
      steps: [
        {
          id: 'step1',
          title: 'Étape 1',
          fields: [
            {
              type: 'text',
              name: 'field1',
              label: 'Champ 1',
              required: true,
            },
          ],
          nextStep: null,
        },
      ],
      thankYou: {
        title: 'Merci !',
        message: 'Votre message de remerciement ici.',
      },
    },
  ],
};

// Obtenir un template par nom
export function getTemplate(templateName: string): FunnelConfig {
  switch (templateName) {
    case 'simple':
      return simpleTemplate;
    case 'quiz':
      return quizTemplate;
    case 'storytelling':
      return storytellingTemplate;
    case 'blank':
    default:
      return blankTemplate;
  }
}

