# Architecture BPC Funnels

## Vue d'ensemble

BPC Funnels est une application Next.js 14 full-stack qui permet de créer, gérer et optimiser des tunnels de conversion (funnels marketing) avec routage automatique des leads.

## Stack Technique

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4
- **UI Components**: Shadcn/ui (Radix UI primitives)
- **Forms**: React Hook Form + Zod validation
- **Animations**: Framer Motion
- **Icons**: Lucide React

### Backend
- **API**: Next.js API Routes
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth (PKCE flow)
- **Storage**: Supabase Storage (futur)

### DevOps
- **Hosting**: Vercel (recommandé) ou Docker
- **CI/CD**: GitHub Actions (futur)
- **Monitoring**: Sentry + Analytics personnalisés

## Architecture de l'Application

```
┌─────────────────────────────────────────────────────────────┐
│                      UTILISATEUR FINAL                       │
│                   (Visiteur du funnel)                       │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ├─ Landing Page (/f/[slug])
                         ├─ Formulaire (/f/[slug]/form)
                         └─ Thank You (/f/[slug]/thank-you)
                         │
                    [Soumission]
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                    API ROUTE: POST /api/leads                │
│  1. Validation (Zod)                                         │
│  2. Insert dans DB                                           │
│  3. Routage automatique ──▶ Lead Router                     │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                    LEAD ROUTER (lib/lead-router.ts)          │
│  1. Récupérer les routing rules (ordre priorité)            │
│  2. Évaluer chaque condition                                 │
│  3. Premier match → Envoyer au webhook                      │
│  4. Update lead status (sent/error)                          │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ├─▶ Webhook Client A
                         ├─▶ Webhook Client B
                         └─▶ Webhook Client C
                         │
                    [Réponse]
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                    SUPABASE DATABASE                         │
│  - funnels (config JSONB)                                    │
│  - leads (données + status)                                  │
│  - routing_rules (conditions)                                │
│  - analytics_events (tracking)                               │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                    ADMIN DASHBOARD                           │
│  - Liste des funnels                                         │
│  - Form Builder (config JSONB)                               │
│  - Routing Config                                            │
│  - Analytics                                                 │
└─────────────────────────────────────────────────────────────┘
```

## Structure des Données

### Table: funnels

```typescript
{
  id: UUID,
  slug: string (unique),
  name: string,
  status: 'draft' | 'active' | 'archived',
  config: {
    tracking: {
      metaPixelId?: string,
      ga4Id?: string,
      gtmId?: string
    },
    variants: [
      {
        key: 'a' | 'b' | 'c',
        weight: number,  // Répartition du trafic
        landing: {
          title: string,
          subtitle: string,
          cta: { text: string, href: string },
          theme: { primaryColor: string, ... }
        },
        steps: [
          {
            id: string,
            title: string,
            fields: [
              {
                type: 'text' | 'email' | 'number' | ...,
                name: string,
                label: string,
                required: boolean,
                ...
              }
            ],
            nextStep: string | null
          }
        ],
        thankYou: { title, message, cta? }
      }
    ]
  }
}
```

### Flux de Routage

```
Lead soumis
    │
    ▼
Routing Rules (triées par priority ASC)
    │
    ├─ Règle 1: capital > 50000 ?
    │   └─ OUI → Webhook Client Premium ✓
    │
    ├─ Règle 2: capital <= 50000 ?
    │   └─ OUI → Webhook Client Standard ✓
    │
    └─ Règle 3: email contains "@" ?
        └─ OUI → Webhook Fallback ✓

Si aucune règle ne match → Error
```

## Patterns de Code

### Server Components (par défaut)

```typescript
// src/app/(dashboard)/funnels/page.tsx
export default async function FunnelsPage() {
  const supabase = await createClient(); // Server client
  const { data } = await supabase.from('funnels').select('*');
  
  return <div>{/* JSX */}</div>;
}
```

### Client Components (avec hooks)

```typescript
// src/app/(dashboard)/funnels/[id]/builder/page.tsx
'use client';

export default function BuilderPage() {
  const [state, setState] = useState();
  const supabase = createClient(); // Browser client
  
  return <div>{/* JSX */}</div>;
}
```

### API Routes

```typescript
// src/app/api/leads/route.ts
export async function POST(request: NextRequest) {
  const body = await request.json();
  const validation = schema.safeParse(body);
  
  if (!validation.success) {
    return NextResponse.json({ error }, { status: 400 });
  }
  
  // Process...
  return NextResponse.json({ success: true });
}
```

## Sécurité

### Authentification
- Supabase Auth avec PKCE flow
- Session persistante dans cookies HTTP-only
- Middleware Next.js pour protection des routes
- Auto-refresh des tokens

### Validation
- Validation Zod côté client ET serveur
- Sanitization des inputs
- Rate limiting sur API (futur)
- CSRF protection (Next.js built-in)

### Base de données
- RLS (Row Level Security) désactivé pour mono-utilisateur
- À activer lors du passage multi-tenant
- Prepared statements via Supabase
- Indexes pour performance

## Performance

### Optimisations
- Server Components par défaut (zéro JS côté client)
- ISR (Incremental Static Regeneration) sur pages publiques
- Image optimization avec next/image
- Code splitting automatique
- Lazy loading des composants lourds

### Caching
- Pages publiques: 60s revalidation
- API responses: no-store (data temps réel)
- Static assets: immutable

## Évolutivité

### Multi-tenant (Phase future)

```sql
-- Ajouter colonne user_id
ALTER TABLE funnels ADD COLUMN user_id UUID REFERENCES auth.users(id);
ALTER TABLE leads ADD COLUMN user_id UUID REFERENCES auth.users(id);

-- Activer RLS
ALTER TABLE funnels ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see own funnels" ON funnels
  FOR SELECT USING (auth.uid() = user_id);
```

### Scalabilité
- Horizontal scaling sur Vercel (serverless)
- Connection pooling Supabase (Supavisor)
- CDN pour assets statiques
- Queue system pour webhooks (futur)

## Monitoring

### Logs
- Console logs structurés (JSON en production)
- Supabase logs pour database queries
- Webhook call logs dans table dédiée

### Metrics (futur)
- Web Vitals (LCP, FID, CLS)
- Conversion rates par funnel
- API response times
- Error rates

## Déploiement

### Vercel (recommandé)
```bash
vercel --prod
```

### Docker
```bash
docker-compose up -d
```

### VPS traditionnel
```bash
pm2 start npm --name bpc-funnels -- start
```

---

**Version**: 1.0.0  
**Dernière mise à jour**: Janvier 2025

