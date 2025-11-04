import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { FunnelsTable } from '@/components/dashboard/funnels-table';
import { EmptyState, EmptyFunnelsIllustration } from '@/components/ui/empty-state';
import type { Funnel } from '@/types';

export const dynamic = 'force-dynamic';

type FunnelWithStats = Funnel & { leadsCount: number };

async function getFunnelsWithStats(): Promise<FunnelWithStats[]> {
  const supabase = await createClient();
  
  // Récupérer les funnels
  const { data: funnels, error } = await supabase
    .from('funnels')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching funnels:', error);
    return [];
  }

  const typedFunnels = (funnels ?? []) as unknown as Funnel[];

  // Récupérer les stats de leads pour chaque funnel
  const funnelsWithStats = await Promise.all(
    typedFunnels.map(async (funnel): Promise<FunnelWithStats> => {
      const { count } = await supabase
        .from('leads')
        .select('*', { count: 'exact', head: true })
        .eq('funnel_id', funnel.id);

      return {
        ...funnel,
        leadsCount: count ?? 0,
      } satisfies FunnelWithStats;
    })
  );

  return funnelsWithStats;
}

export default async function FunnelsPage() {
  const funnels = await getFunnelsWithStats();

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

      <Card className="overflow-hidden">
        {funnels.length === 0 ? (
          <EmptyState
            icon={<EmptyFunnelsIllustration />}
            title="Aucun funnel pour le moment"
            description="Créez votre premier tunnel de conversion pour commencer à collecter des leads"
            action={{
              label: 'Créer un funnel',
              href: '/funnels/new',
            }}
          />
        ) : (
          <FunnelsTable funnels={funnels} />
        )}
      </Card>
    </div>
  );
}

