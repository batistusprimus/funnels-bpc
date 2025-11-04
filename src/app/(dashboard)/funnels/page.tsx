import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { statusStyles, formatDate } from '@/lib/utils';
import type { Funnel } from '@/types';

export const dynamic = 'force-dynamic';

async function getFunnels(): Promise<Funnel[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('funnels')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching funnels:', error);
    return [];
  }

  return data as Funnel[];
}

async function getFunnelStats(funnelId: string) {
  const supabase = await createClient();
  
  const { count } = await supabase
    .from('leads')
    .select('*', { count: 'exact', head: true })
    .eq('funnel_id', funnelId);

  return {
    leads: count || 0,
  };
}

export default async function FunnelsPage() {
  const funnels = await getFunnels();

  return (
    <div className="container py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Mes Funnels</h1>
          <p className="text-muted-foreground">
            Gérez vos tunnels de conversion
          </p>
        </div>
        <Button asChild>
          <Link href="/funnels/new">+ Créer un funnel</Link>
        </Button>
      </div>

      {funnels.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <p className="text-lg text-muted-foreground mb-4">
              Vous n'avez pas encore de funnel
            </p>
            <Button asChild>
              <Link href="/funnels/new">Créer votre premier funnel</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {funnels.map((funnel) => (
            <FunnelCard key={funnel.id} funnel={funnel} />
          ))}
        </div>
      )}
    </div>
  );
}

async function FunnelCard({ funnel }: { funnel: Funnel }) {
  const stats = await getFunnelStats(funnel.id);

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle>{funnel.name}</CardTitle>
            <CardDescription className="font-mono text-xs">
              /{funnel.slug}
            </CardDescription>
          </div>
          <Badge className={statusStyles[funnel.status]}>
            {funnel.status === 'draft' && 'Brouillon'}
            {funnel.status === 'active' && 'Actif'}
            {funnel.status === 'archived' && 'Archivé'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="flex-1">
        {funnel.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {funnel.description}
          </p>
        )}
        <div className="mt-4 flex items-center gap-4 text-sm">
          <div>
            <span className="font-semibold">{stats.leads}</span>
            <span className="text-muted-foreground"> leads</span>
          </div>
          <div className="text-muted-foreground text-xs">
            {formatDate(funnel.created_at)}
          </div>
        </div>
      </CardContent>
      <CardFooter className="gap-2">
        <Button asChild variant="outline" className="flex-1">
          <Link href={`/funnels/${funnel.id}`}>Voir</Link>
        </Button>
        <Button asChild className="flex-1">
          <Link href={`/funnels/${funnel.id}/builder`}>Éditer</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

