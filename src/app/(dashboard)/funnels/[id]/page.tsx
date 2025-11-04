import { use } from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { statusStyles, formatDate } from '@/lib/utils';
import type { Funnel } from '@/types';

interface FunnelDetailPageProps {
  params: Promise<{ id: string }>;
}

export const dynamic = 'force-dynamic';

async function getFunnel(id: string): Promise<Funnel | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('funnels')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) {
    return null;
  }

  return data as Funnel;
}

async function getLeadsCount(funnelId: string) {
  const supabase = await createClient();
  const { count } = await supabase
    .from('leads')
    .select('*', { count: 'exact', head: true })
    .eq('funnel_id', funnelId);

  return count || 0;
}

export default async function FunnelDetailPage({ params }: FunnelDetailPageProps) {
  const resolvedParams = await params;
  const funnel = await getFunnel(resolvedParams.id);

  if (!funnel) {
    redirect('/funnels');
  }

  const leadsCount = await getLeadsCount(funnel.id);

  return (
    <div className="container py-8">
      <div className="mb-8 flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold">{funnel.name}</h1>
            <Badge className={statusStyles[funnel.status]}>
              {funnel.status === 'draft' && 'Brouillon'}
              {funnel.status === 'active' && 'Actif'}
              {funnel.status === 'archived' && 'Archivé'}
            </Badge>
          </div>
          <p className="text-muted-foreground">
            Créé le {formatDate(funnel.created_at)}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/funnels">Retour</Link>
          </Button>
          <Button asChild>
            <Link href={`/funnels/${funnel.id}/builder`}>Éditer</Link>
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="config">Configuration</TabsTrigger>
          <TabsTrigger value="preview">Prévisualisation</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Leads collectés</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{leadsCount}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Variantes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {funnel.config.variants?.length || 0}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Étapes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {funnel.config.variants?.[0]?.steps?.length || 0}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Actions rapides</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              <Button asChild variant="outline" className="justify-start">
                <Link href={`/funnels/${funnel.id}/builder`}>
                  ✏️ Éditer le formulaire
                </Link>
              </Button>
              <Button asChild variant="outline" className="justify-start">
                <Link href={`/funnels/${funnel.id}/routing`}>
                  🔀 Configurer le routage
                </Link>
              </Button>
              <Button asChild variant="outline" className="justify-start">
                <Link href={`/funnels/${funnel.id}/analytics`}>
                  📊 Voir les analytics
                </Link>
              </Button>
              <Button asChild variant="outline" className="justify-start">
                <Link href={`/f/${funnel.slug}`} target="_blank">
                  🔗 Ouvrir la page publique
                </Link>
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="config" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Informations générales</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="text-sm font-medium text-muted-foreground">Slug</div>
                <div className="font-mono">/f/{funnel.slug}</div>
              </div>

              {funnel.domain && (
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Domaine</div>
                  <div>{funnel.domain}</div>
                </div>
              )}

              {funnel.description && (
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Description</div>
                  <div>{funnel.description}</div>
                </div>
              )}
            </CardContent>
          </Card>

          {funnel.config.tracking && (
            <Card>
              <CardHeader>
                <CardTitle>Tracking</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {funnel.config.tracking.metaPixelId && (
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Meta Pixel ID</div>
                    <div className="font-mono">{funnel.config.tracking.metaPixelId}</div>
                  </div>
                )}

                {funnel.config.tracking.ga4Id && (
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Google Analytics 4</div>
                    <div className="font-mono">{funnel.config.tracking.ga4Id}</div>
                  </div>
                )}

                {funnel.config.tracking.gtmId && (
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Google Tag Manager</div>
                    <div className="font-mono">{funnel.config.tracking.gtmId}</div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="preview">
          <Card>
            <CardContent className="py-8">
              <p className="text-center text-muted-foreground mb-4">
                Aperçu du funnel (variante A)
              </p>
              <div className="flex justify-center">
                <Button asChild>
                  <Link href={`/f/${funnel.slug}?v=a`} target="_blank">
                    Ouvrir dans un nouvel onglet
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

