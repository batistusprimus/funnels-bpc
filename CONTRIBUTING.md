# Guide de Contribution - BPC Funnels

## 🎯 Philosophie du projet

### KISS (Keep It Simple, Stupid)

Ce projet suit le principe KISS : privilégier des solutions simples et fonctionnelles plutôt que des solutions complexes.

- ✅ Code simple et lisible
- ✅ Fonctionnalités essentielles d'abord
- ✅ Éviter l'over-engineering
- ❌ Pas de micro-optimisations prématurées
- ❌ Pas de patterns complexes sans raison

## 📝 Standards de Code

### TypeScript

- Toujours typer les variables, fonctions et composants
- Éviter `any` à tout prix
- Utiliser les types définis dans `src/types/index.ts`
- Préférer les interfaces aux types pour les objets

```typescript
// ✅ Bon
interface User {
  id: string;
  email: string;
}

function getUser(id: string): Promise<User | null> {
  // ...
}

// ❌ Mauvais
function getUser(id: any): any {
  // ...
}
```

### React Components

- Privilégier les Server Components par défaut
- Utiliser Client Components uniquement quand nécessaire (`'use client'`)
- Un composant = un fichier
- Nommer les composants en PascalCase

```typescript
// ✅ Bon - Server Component
export default async function FunnelsPage() {
  const data = await fetchData();
  return <div>{data}</div>;
}

// ✅ Bon - Client Component (quand hooks nécessaires)
'use client';
export default function FormEditor() {
  const [state, setState] = useState();
  return <div>{state}</div>;
}
```

### Validation

- Toujours valider les données avec Zod
- Validation côté client ET serveur
- Schémas réutilisables dans `src/lib/validation.ts`

```typescript
// ✅ Bon
const schema = z.object({
  email: z.string().email(),
  name: z.string().min(1),
});

const result = schema.safeParse(data);
if (!result.success) {
  // Gérer l'erreur
}
```

### Gestion des Erreurs

- Toujours gérer les erreurs
- Afficher des messages clairs à l'utilisateur
- Logger les erreurs en console pour debug

```typescript
// ✅ Bon
try {
  const result = await apiCall();
  toast.success('Succès !');
} catch (error) {
  console.error('Error:', error);
  toast.error('Une erreur est survenue');
}
```

## 🗂️ Organisation des Fichiers

### Structure des dossiers

```
src/
├── app/                    # Routes Next.js
│   ├── (dashboard)/       # Routes protégées
│   ├── api/               # API routes
│   └── f/                 # Pages publiques
├── components/
│   ├── ui/                # Composants Shadcn (ne pas modifier)
│   └── dashboard/         # Composants métier
├── lib/                   # Logique métier et utilitaires
├── types/                 # Types TypeScript globaux
```

### Nommage des fichiers

- Routes : `page.tsx`, `layout.tsx`, `route.ts`
- Composants : `component-name.tsx` (kebab-case)
- Utilitaires : `utility-name.ts` (kebab-case)
- Types : `index.ts` dans `src/types/`

## 🎨 UI/UX

### Composants Shadcn

- Utiliser uniquement les composants Shadcn/ui
- Ne jamais créer de composants custom sans raison
- Pour ajouter un nouveau composant : `npx shadcn@latest add [component]`

### Styles

- Utiliser Tailwind CSS exclusivement
- Pas de CSS custom sauf cas exceptionnels
- Utiliser les classes utilitaires de `src/lib/utils.ts` (cn)

```typescript
// ✅ Bon
<div className={cn("p-4", isActive && "bg-blue-500")}>
  Content
</div>

// ❌ Mauvais
<div style={{ padding: "16px", backgroundColor: isActive ? "blue" : "" }}>
  Content
</div>
```

### Notifications

- Utiliser `toast` de Sonner pour tous les feedbacks
- Types : `toast.success()`, `toast.error()`, `toast.info()`
- Messages courts et clairs

## 🗄️ Base de Données

### Supabase

- Toujours utiliser les clients appropriés :
  - `createClient()` from `@/lib/supabase/client` (client components)
  - `createClient()` from `@/lib/supabase/server` (server components/API)
- Typer les résultats avec les types de `src/types/`

```typescript
// ✅ Bon - Server Component
import { createClient } from '@/lib/supabase/server';

const supabase = await createClient();
const { data } = await supabase.from('funnels').select('*');

// ✅ Bon - Client Component
import { createClient } from '@/lib/supabase/client';

const supabase = createClient();
const { data } = await supabase.from('funnels').select('*');
```

### Migrations

- Créer un nouveau fichier pour chaque migration
- Format : `YYYYMMDD_description.sql`
- Toujours tester localement avant production

## 🧪 Tests (Future)

Pour le moment, pas de tests automatisés. À implémenter plus tard :

- Tests unitaires avec Jest
- Tests E2E avec Playwright
- Tests d'intégration API

## 🚀 Workflow de Développement

### 1. Créer une branche

```bash
git checkout -b feature/nom-de-la-feature
# ou
git checkout -b fix/nom-du-bug
```

### 2. Développer

- Coder selon les standards ci-dessus
- Commiter régulièrement avec des messages clairs
- Format des commits : `type(scope): message`

```bash
git commit -m "feat(funnel): add duplicate functionality"
git commit -m "fix(routing): handle empty rules"
git commit -m "docs(readme): update installation steps"
```

Types :
- `feat`: nouvelle fonctionnalité
- `fix`: correction de bug
- `docs`: documentation
- `style`: formatage, points-virgules manquants, etc.
- `refactor`: refactoring du code
- `test`: ajout de tests
- `chore`: tâches de maintenance

### 3. Tester localement

```bash
npm run dev
# Tester toutes les fonctionnalités affectées
```

### 4. Build de validation

```bash
npm run build
npm run type-check
```

### 5. Pusher et créer une PR (si multi-dev)

```bash
git push origin feature/nom-de-la-feature
```

## 🔒 Sécurité

### Variables d'environnement

- Ne JAMAIS commiter `.env.local`
- Utiliser `.env.example` comme template
- Valider toutes les entrées utilisateur

### Données sensibles

- Pas de clés API en dur dans le code
- Utiliser `process.env.NEXT_PUBLIC_*` pour variables publiques
- Utiliser `process.env.*` (sans NEXT_PUBLIC) pour secrets serveur

## 📚 Ressources

### Documentation externe

- [Next.js App Router](https://nextjs.org/docs)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript)
- [Shadcn/ui Components](https://ui.shadcn.com/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Zod Validation](https://zod.dev/)

### Exemples dans le code

- Form Builder : `src/app/(dashboard)/funnels/[id]/builder/page.tsx`
- API Route : `src/app/api/leads/route.ts`
- Routage : `src/lib/lead-router.ts`
- Validation : `src/lib/validation.ts`

## ❓ Questions

Pour toute question ou suggestion :

1. Consulter le README.md
2. Consulter la documentation externe
3. Examiner le code existant
4. Contacter l'équipe

---

**Remember** : Code simple > Code clever

