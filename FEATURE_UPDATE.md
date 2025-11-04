# Nouvelles Fonctionnalités - BPC Funnels

## 🎨 Dark Mode
Le dark mode est maintenant disponible sur toute l'application avec `next-themes`.
- **Toggle** : Disponible dans la barre de navigation
- **Détection système** : S'adapte automatiquement au thème de votre OS
- **Persistance** : Votre choix est sauvegardé

## 🏷️ Système de Tags
Organisez vos funnels avec des tags personnalisés.
- **Ajout de tags** : Dans le formulaire de création/édition de funnel
- **Filtrage** : Utilisez la recherche dans le tableau des funnels pour filtrer par tags
- **Affichage** : Les tags sont visibles dans le tableau des funnels

## 📦 Marketplace de Templates
Une nouvelle page dédiée aux templates pré-configurés.
- **Navigation** : Menu "Templates" dans la barre de navigation
- **Import/Export JSON** : Partagez vos configurations de funnels
- **Templates prédéfinis** : 3 templates de démarrage disponibles
- **Filtres** : Recherchez par nom, catégorie ou tags

## 🚀 Installation

### 1. Appliquer les migrations SQL

```bash
# Se connecter à Supabase
cd bpc-funnels

# Appliquer la migration des tags
psql -h <SUPABASE_HOST> -U postgres -d postgres < supabase/migrations/20250105_add_tags.sql

# Appliquer le seed des templates (optionnel mais recommandé)
psql -h <SUPABASE_HOST> -U postgres -d postgres < supabase/migrations/20250105_seed_templates.sql
```

Ou via l'interface Supabase :
1. Allez dans **SQL Editor**
2. Copiez le contenu de `20250105_add_tags.sql`
3. Exécutez la requête
4. Répétez avec `20250105_seed_templates.sql`

### 2. Redémarrer l'application

```bash
npm run dev
```

## 📝 Utilisation

### Tags
1. Créez un nouveau funnel ou éditez un existant
2. Dans la section "Tags", tapez votre tag et appuyez sur **Entrée** ou **virgule**
3. Les tags apparaîtront dans le tableau des funnels et seront filtrables

### Templates
1. Accédez à la page **Templates** via la navigation
2. **Utiliser** : Crée un nouveau funnel basé sur le template
3. **Exporter** : Télécharge la configuration en JSON
4. **Importer** : Utilisez le bouton "Importer JSON" pour charger un template depuis un fichier

### Dark Mode
1. Cliquez sur l'icône soleil/lune dans la barre de navigation
2. Le thème bascule entre clair et sombre
3. Par défaut, le thème suit les préférences de votre système

## 🛠️ Fichiers modifiés/créés

### Nouveaux fichiers
- `src/components/theme-toggle.tsx` - Composant de toggle dark/light
- `src/components/theme-provider.tsx` - Provider Next Themes
- `src/components/ui/tag-input.tsx` - Input pour les tags
- `src/app/(dashboard)/templates/page.tsx` - Page marketplace
- `supabase/migrations/20250105_add_tags.sql` - Migration tags + table templates
- `supabase/migrations/20250105_seed_templates.sql` - Données initiales templates

### Fichiers modifiés
- `src/app/layout.tsx` - Ajout du ThemeProvider
- `src/components/dashboard/nav.tsx` - Ajout du ThemeToggle et lien Templates
- `src/types/index.ts` - Ajout du champ tags à Funnel
- `src/components/dashboard/funnels-table.tsx` - Colonne tags
- `src/app/(dashboard)/funnels/new/page.tsx` - Input tags dans le formulaire

## ✅ Tests recommandés
1. Créer un funnel avec des tags
2. Filtrer les funnels par tags
3. Basculer entre dark/light mode
4. Explorer les templates et en utiliser un
5. Exporter un funnel en JSON
6. Importer un JSON

## 📚 Documentation technique

### Structure des tags
```typescript
interface Funnel {
  // ...
  tags: string[]; // Tableau de strings
}
```

### Structure d'un template
```typescript
interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  tags: string[];
  config: FunnelConfig; // Configuration complète du funnel
  download_count: number;
  is_public: boolean;
}
```

