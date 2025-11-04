# Changelog

Toutes les modifications notables de ce projet seront documentées dans ce fichier.

## [1.0.0] - 2025-01-04

### 🎉 Version initiale (MVP)

#### Ajouté

**Authentification**
- Login avec Supabase Auth (email/password)
- Middleware de protection des routes
- Déconnexion

**Dashboard**
- Liste de tous les funnels avec stats
- Création de funnel avec wizard multi-étapes
- 4 templates prédéfinis : Simple, Storytelling, Quiz, Vierge
- Configuration tracking (Meta Pixel, GA4, GTM)

**Form Builder**
- Interface split-screen (éditeur + preview)
- Édition de la landing page (titre, sous-titre, CTA, couleurs)
- Gestion des étapes du formulaire
- Gestion des champs avec types :
  - Texte, Email, Téléphone, Nombre
  - Zone de texte, Liste déroulante
  - Boutons radio, Cases à cocher
- Preview en temps réel
- Auto-save toutes les 3 secondes
- Édition de la page de remerciement

**Routage des Leads**
- Interface de configuration des règles de routage
- Conditions avec opérateurs : ==, !=, >, <, >=, <=, contains, startsWith, endsWith
- Réordonnancement par priorité (drag via boutons ↑↓)
- Activation/désactivation des règles
- Support multi-clients avec webhooks personnalisés

**Pages Publiques**
- Landing page dynamique avec variantes A/B/C
- Formulaire multi-étapes avec validation
- Barre de progression
- Page de remerciement
- Support des UTM parameters
- Tracking automatique (Meta Pixel, GA4)

**API**
- POST /api/leads - Soumission de lead
- GET /api/leads - Liste des leads
- Routage automatique des leads via webhooks
- Gestion des erreurs et retry

**Analytics**
- Vue d'ensemble par funnel
- Métriques clés : leads, envoyés, erreurs, taux
- Performance par variante (A/B/C)
- Distribution par client
- Liste des derniers leads

**Liste des Leads**
- Vue globale de tous les leads
- Filtrage par funnel
- Affichage des données collectées
- Status d'envoi (pending, sent, error)
- Messages d'erreur détaillés

**Base de données**
- Schéma complet avec 4 tables :
  - funnels
  - leads
  - routing_rules
  - analytics_events
- Indexes pour performance
- Triggers pour updated_at
- Structure préparée pour RLS (multi-tenant futur)

**UI/UX**
- Design moderne avec Shadcn/ui
- Interface responsive (mobile/desktop)
- Toast notifications
- Loading states
- Validation avec messages d'erreur clairs
- Badges de status colorés

**Documentation**
- README complet avec guide d'installation
- QUICK_START pour démarrage rapide
- DEPLOYMENT avec instructions Vercel et VPS
- Commentaires dans le code
- Types TypeScript exhaustifs

### 🔧 Technique

**Stack**
- Next.js 14 (App Router)
- TypeScript strict
- Supabase (PostgreSQL + Auth)
- Tailwind CSS
- Shadcn/ui
- React Hook Form + Zod
- Date-fns

**Architecture**
- Server Components pour performance
- Client Components pour interactivité
- Middleware pour auth
- API Routes pour backend
- Types partagés
- Validation côté client et serveur

**Sécurité**
- Variables d'environnement pour secrets
- Validation Zod sur toutes les entrées
- Protection CSRF via middleware Next.js
- Headers sécurisés
- Préparé pour RLS Supabase

## [À venir] - Roadmap

### Phase 2 (Post-48h)
- [ ] Drag & drop dans le form builder
- [ ] Upload d'images pour landing pages
- [ ] Duplication de funnel en 1 clic
- [ ] Gestion des assets/images
- [ ] API LeadProsper (récupération stats)
- [ ] Webhooks entrants
- [ ] A/B testing automatique avec optimisation

### Phase 3 (Future)
- [ ] Multi-tenant (support multi-utilisateurs)
- [ ] Row Level Security (RLS)
- [ ] Rôles et permissions
- [ ] Export CSV avancé
- [ ] Graphiques avancés (charts.js)
- [ ] Templates marketplace
- [ ] API publique
- [ ] Webhooks sortants avancés
- [ ] Intégrations natives (Zapier, Make, etc.)
- [ ] Tests A/B automatiques avec ML
- [ ] Email sequences
- [ ] SMS notifications
- [ ] Tests E2E avec Playwright

## Notes de version

### Compatibilité

- Node.js >= 20.9.0 (OBLIGATOIRE)
- Navigateurs modernes (Chrome, Firefox, Safari, Edge)
- Mobile responsive

### Migration depuis version précédente

N/A - Première version

### Breaking Changes

N/A - Première version

---

Format basé sur [Keep a Changelog](https://keepachangelog.com/fr/1.0.0/)

