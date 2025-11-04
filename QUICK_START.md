# 🚀 Guide de Démarrage Rapide - BPC Funnels

## Mise en route en 5 minutes

### Étape 1 : Configuration Supabase (2 minutes)

1. **Créer un projet Supabase**
   - Aller sur https://supabase.com
   - Créer un nouveau projet
   - Noter l'URL et les clés API

2. **Exécuter la migration SQL**
   - Aller dans l'éditeur SQL de Supabase
   - Copier tout le contenu de `supabase/migrations/20250104_initial_schema.sql`
   - Exécuter

3. **Créer votre compte admin**
   - Aller dans **Authentication** > **Users**
   - Cliquer sur **Add user**
   - Email : `votre@email.com`
   - Password : `votre-mot-de-passe-sécurisé`

### Étape 2 : Configuration locale (1 minute)

```bash
# Installer les dépendances
npm install

# Configurer les variables d'environnement
cp .env.example .env.local
```

Éditer `.env.local` avec vos clés Supabase :

```env
NEXT_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhb...
SUPABASE_SERVICE_ROLE_KEY=eyJhb...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Étape 3 : Lancer l'application (30 secondes)

```bash
npm run dev
```

Ouvrir http://localhost:3000

### Étape 4 : Créer votre premier funnel (2 minutes)

1. **Se connecter**
   - Email et mot de passe créés dans Supabase

2. **Créer un funnel**
   - Cliquer sur **"+ Créer un funnel"**
   - Nom : `Mon premier funnel`
   - Slug : `test-funnel`
   - Template : **Landing Simple**
   - Cliquer sur **"Créer"**

3. **Configurer le routage**
   - Aller dans **"Configuration du routage"**
   - Ajouter une règle :
     - Champ : `email`
     - Opérateur : `contains`
     - Valeur : `@`
     - Client : `Test Client`
     - Webhook : `https://webhook.site/...` (créer un webhook test sur webhook.site)
   - Sauvegarder

4. **Activer le funnel**
   - Dans Supabase, aller dans la table `funnels`
   - Modifier le status de `draft` à `active`

5. **Tester !**
   - Ouvrir http://localhost:3000/f/test-funnel
   - Remplir le formulaire
   - Vérifier que le lead arrive sur votre webhook

## 🎉 C'est prêt !

Vous avez maintenant un funnel fonctionnel qui :
- ✅ Affiche une landing page
- ✅ Collecte des leads via un formulaire
- ✅ Route automatiquement les leads vers un webhook
- ✅ Stocke tout dans Supabase

## Prochaines étapes

- **Personnaliser le design** : Modifier les couleurs, textes dans le Form Builder
- **Ajouter des champs** : Email, téléphone, budget, etc.
- **Configurer le tracking** : Ajouter Meta Pixel, GA4
- **Créer des variantes** : Tester différentes versions (A/B/C)
- **Voir les analytics** : Suivre les performances

## Besoin d'aide ?

Consulter le README complet pour plus de détails : [README.md](./README.md)

---

**Questions fréquentes**

**Q : Comment activer un funnel ?**
R : Dans Supabase, changer le status de `draft` à `active` dans la table `funnels`.

**Q : Les leads ne sont pas routés ?**
R : Vérifier qu'il y a au moins une règle de routage et que le webhook URL est correct.

**Q : Erreur de connexion ?**
R : Vérifier que les clés Supabase dans `.env.local` sont correctes.

