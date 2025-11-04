# BPC Funnels

Un outil SaaS interne pour créer et gérer des tunnels de conversion (funnels) avec routage automatique des leads.

## 🚀 Fonctionnalités

- ✅ **Création de funnels** en quelques minutes via interface graphique
- ✅ **Form Builder visuel** avec preview en temps réel
- ✅ **A/B/C Testing** avec répartition du trafic
- ✅ **Routage conditionnel** des leads vers différents webhooks
- ✅ **Analytics basiques** par funnel et variante
- ✅ **Templates prédéfinis** (Simple, Quiz, Storytelling)
- ✅ **Tracking** (Meta Pixel, Google Analytics 4, GTM)

## 🛠️ Stack Technique

- **Framework**: Next.js 14 (App Router, TypeScript)
- **Base de données**: Supabase (PostgreSQL)
- **UI**: Shadcn/ui + Tailwind CSS
- **Forms**: React Hook Form + Zod
- **Auth**: Supabase Auth
- **Hosting**: Vercel

## 📋 Prérequis

- **Node.js 20.9.0 ou supérieur** (OBLIGATOIRE pour Next.js 16)
- Un compte Supabase
- Un compte Vercel (pour le déploiement)

> ⚠️ **Important** : Next.js 16 nécessite Node.js >= 20.9.0. Si vous avez une version inférieure, installez Node 20+ avec nvm :
> ```bash
> nvm install 20
> nvm use 20
> ```

## 🔧 Installation

### 1. Cloner le projet

```bash
git clone <repository-url>
cd bpc-funnels
```

### 2. Installer les dépendances

```bash
npm install
```

### 3. Configuration Supabase

#### a. Créer un projet Supabase

1. Aller sur [supabase.com](https://supabase.com)
2. Créer un nouveau projet
3. Noter l'URL et la clé ANON KEY

#### b. Exécuter les migrations SQL

1. Aller dans l'éditeur SQL de Supabase
2. Copier et exécuter le contenu du fichier `supabase/migrations/20250104_initial_schema.sql`

#### c. Créer un utilisateur admin

Dans l'éditeur SQL de Supabase :

```sql
-- Créer un utilisateur avec email/password
-- Via l'interface Supabase Auth > Users > Add user
-- Ou via SQL :
SELECT auth.uid(); -- Pour récupérer l'UID après création
```

Ou via l'interface Supabase :
1. Aller dans **Authentication** > **Users**
2. Cliquer sur **Add user**
3. Entrer votre email et mot de passe

### 4. Configuration des variables d'environnement

Copier `.env.example` vers `.env.local` :

```bash
cp .env.example .env.local
```

Puis éditer `.env.local` :

```env
NEXT_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre-anon-key
SUPABASE_SERVICE_ROLE_KEY=votre-service-role-key

NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 5. Lancer le serveur de développement

```bash
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000)

## 📖 Utilisation

### Se connecter

1. Aller sur `/login`
2. Entrer l'email et le mot de passe créés dans Supabase

### Créer un funnel

1. Cliquer sur **"+ Créer un funnel"**
2. Remplir les informations :
   - Nom du funnel
   - Slug (URL publique)
   - Domaine personnalisé (optionnel)
   - Description
3. Choisir un template :
   - **Landing Simple** : page courte + formulaire basique
   - **Landing Storytelling** : longue page + formulaire détaillé
   - **Quiz Multi-Étapes** : questions progressives
   - **Vierge** : partir de zéro
4. Configurer le tracking (Meta Pixel, GA4, GTM)
5. Cliquer sur **"Créer le funnel"**

### Éditer le formulaire (Form Builder)

1. Depuis la liste des funnels, cliquer sur **"Éditer"**
2. Interface divisée en deux :
   - **Gauche** : éditeur
   - **Droite** : preview en temps réel

#### Éditer la landing page

1. Onglet **"Landing"**
2. Modifier :
   - Titre et sous-titre
   - Texte du CTA
   - Couleur principale

#### Éditer le formulaire

1. Onglet **"Formulaire"**
2. Actions disponibles :
   - **Ajouter une étape** : créer une nouvelle étape
   - **Ajouter un champ** : ajouter un champ à une étape
   - **Éditer un champ** : cliquer sur ✏️ pour modifier les propriétés
   - **Supprimer** : cliquer sur 🗑️
3. Types de champs supportés :
   - Texte, Email, Téléphone
   - Nombre (avec min/max)
   - Zone de texte
   - Liste déroulante
   - Boutons radio
   - Case à cocher

#### Éditer la page de remerciement

1. Onglet **"Thank You"**
2. Modifier :
   - Titre et message
   - CTA optionnel (ex: lien Calendly)

### Configurer le routage des leads

1. Aller dans **"Configuration du routage"**
2. Créer des règles :
   - **Champ** : champ du formulaire à évaluer
   - **Opérateur** : ==, !=, >, <, >=, <=, contains, startsWith, endsWith
   - **Valeur** : valeur à comparer
   - **Client** : nom du client destinataire
   - **Webhook URL** : URL où envoyer le lead

**Exemple** :
```
Si le champ "capital" est supérieur à 50000
→ Envoyer vers FMDB (https://webhook.fmdb.com/leads)

Si le champ "capital" est inférieur ou égal à 50000
→ Envoyer vers La Relève (https://webhook.lareleve.com/leads)
```

**Important** : Les règles sont évaluées dans l'ordre de priorité (de haut en bas). Utilisez les flèches ↑↓ pour réordonner.

### Activer un funnel

1. Aller dans les détails du funnel
2. Le status doit être **"Actif"** pour que la page publique soit accessible
3. Pour activer : éditer le funnel et changer le status dans la base de données

### Accéder à la page publique

URL format : `https://votre-domaine.com/f/votre-slug`

Exemples :
- `https://bpc-funnels.vercel.app/f/flipimmo-guide`
- `https://bpc-funnels.vercel.app/f/flipimmo-guide?v=a` (forcer la variante A)
- `https://bpc-funnels.vercel.app/f/flipimmo-guide?utm_source=facebook&utm_campaign=test` (avec UTM)

### Voir les analytics

1. Aller dans un funnel
2. Cliquer sur **"Voir les analytics"**
3. Métriques disponibles :
   - Total leads, envoyés, erreurs
   - Performance par variante (A/B/C)
   - Distribution par client
   - Derniers leads collectés

### Voir tous les leads

1. Menu **"Leads"**
2. Liste de tous les leads avec :
   - Date de création
   - Funnel d'origine
   - Variante testée
   - Email/nom
   - Client destinataire
   - Status d'envoi

## 🔒 Sécurité

### Row Level Security (RLS)

Par défaut, RLS est **désactivé** car l'application est mono-utilisateur.

Pour activer RLS lors du passage multi-tenant :

1. Décommenter les politiques dans `supabase/migrations/20250104_initial_schema.sql`
2. Ajouter une colonne `user_id` à toutes les tables
3. Mettre à jour les requêtes pour filtrer par `user_id`

### Variables d'environnement

**Ne jamais commit** les fichiers `.env.local` avec les vraies clés.

## 🚀 Déploiement sur Vercel

### 1. Pousser le code sur GitHub

```bash
git add .
git commit -m "Initial commit"
git push origin main
```

### 2. Connecter à Vercel

1. Aller sur [vercel.com](https://vercel.com)
2. Cliquer sur **"New Project"**
3. Importer le repository GitHub
4. Configurer les variables d'environnement :
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `NEXT_PUBLIC_APP_URL` (sera fourni par Vercel)
5. Cliquer sur **"Deploy"**

### 3. Configurer le domaine personnalisé (optionnel)

1. Dans Vercel, aller dans **Settings** > **Domains**
2. Ajouter votre domaine
3. Configurer les DNS selon les instructions

## 📊 Structure du projet

```
bpc-funnels/
├── src/
│   ├── app/
│   │   ├── (dashboard)/          # Routes protégées
│   │   │   ├── funnels/          # Gestion des funnels
│   │   │   └── leads/            # Liste des leads
│   │   ├── f/[slug]/             # Pages publiques des funnels
│   │   ├── api/                  # API routes
│   │   └── login/                # Authentification
│   ├── components/
│   │   ├── ui/                   # Composants Shadcn
│   │   └── dashboard/            # Composants dashboard
│   ├── lib/
│   │   ├── supabase/             # Clients Supabase
│   │   ├── lead-router.ts        # Logique de routage
│   │   ├── templates.ts          # Templates prédéfinis
│   │   └── validation.ts         # Schémas Zod
│   └── types/
│       └── index.ts              # Types TypeScript
├── supabase/
│   └── migrations/               # Migrations SQL
└── middleware.ts                 # Auth middleware
```

## 🐛 Dépannage

### Erreur "Funnel not found"

- Vérifier que le funnel a le status **"active"** dans la base de données
- Vérifier que le slug est correct

### Les leads ne sont pas routés

- Vérifier qu'il y a au moins une règle de routage configurée
- Vérifier que les webhooks URL sont corrects
- Regarder les logs dans la console du navigateur

### Erreur de connexion à Supabase

- Vérifier que les variables d'environnement sont correctes
- Vérifier que le projet Supabase est bien lancé
- Vérifier que les migrations SQL ont été exécutées

### Erreur TypeScript

```bash
npm run build
```

Pour voir toutes les erreurs TypeScript.

## 📝 TODO / Améliorations futures

- [ ] Drag & drop pour réordonner les champs
- [ ] Upload d'images pour les landing pages
- [ ] Duplication de funnel en 1 clic
- [ ] Export CSV des leads
- [ ] Webhooks entrants (callbacks)
- [ ] Graphiques avancés (charts.js)
- [ ] Multi-tenant (support de plusieurs utilisateurs)
- [ ] API publique pour intégrations externes
- [ ] Tests unitaires et E2E

## 📄 Licence

Propriétaire - Usage interne uniquement

## 👤 Auteur

Baptiste Piocelle - BPC CORP

---

**Date de création** : Janvier 2025
**Version** : 1.0.0 (MVP)
