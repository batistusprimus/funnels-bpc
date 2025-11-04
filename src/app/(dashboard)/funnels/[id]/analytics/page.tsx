import { use } from 'react';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatDateTime, formatNumber, formatPercent, statusStyles } from '@/lib/utils';
import type { Funnel, Lead } from '@/types';

interface AnalyticsPageProps {
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

async function getLeads(funnelId: string): Promise<Lead[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('leads')
    .select('*')
    .eq('funnel_id', funnelId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching leads:', error);
    return [];
  }

  return data as Lead[];
}

export default async function AnalyticsPage({ params }: AnalyticsPageProps) {
  const resolvedParams = await params;
  const funnel = await getFunnel(resolvedParams.id);

  if (!funnel) {
    redirect('/funnels');
  }

  const leads = await getLeads(funnel.id);

  // Calculer les métriques
  const totalLeads = leads.length;
  const sentLeads = leads.filter((l) => l.status === 'sent').length;
  const errorLeads = leads.filter((l) => l.status === 'error').length;
  const sentRate = totalLeads > 0 ? (sentLeads / totalLeads) * 100 : 0;

  // Stats par variante
  const variantStats = funnel.config.variants.map((variant) => {
    const variantLeads = leads.filter((l) => l.variant === variant.key);
    const variantSent = variantLeads.filter((l) => l.status === 'sent').length;
    
    return {
      variant: variant.key,
      leads: variantLeads.length,
      sent: variantSent,
      conversion: variantLeads.length > 0 ? (variantSent / variantLeads.length) * 100 : 0,
    };
  });

  // Stats par client
  const clientStats: Record<string, number> = {};
  leads.forEach((lead) => {
    if (lead.sent_to_client) {
      clientStats[lead.sent_to_client] = (clientStats[lead.sent_to_client] || 0) + 1;
    }
  });

  const clientStatsArray = Object.entries(clientStats)
    .map(([client, count]) => ({
      client,
      leads: count,
      percentage: totalLeads > 0 ? (count / totalLeads) * 100 : 0,
    }))
    .sort((a, b) => b.leads - a.leads);

  // Derniers leads
  const recentLeads = leads.slice(0, 10);

  return (
    <div className="container py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{funnel.name}</h1>
          <p className="text-muted-foreground">Analytics</p>
        </div>
        <Button variant="outline" onClick={() => window.history.back()}>
          Retour
        </Button>
      </div>

      {/* Métriques clés */}
      <div className="mb-6 grid gap-6 md:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(totalLeads)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Envoyés</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatNumber(sentLeads)}
            </div>
            <p className="text-xs text-muted-foreground">{formatPercent(sentRate)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Erreurs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatNumber(errorLeads)}
            </div>
            <p className="text-xs text-muted-foreground">
              {formatPercent(totalLeads > 0 ? (errorLeads / totalLeads) * 100 : 0)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Taux d'envoi</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPercent(sentRate)}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Stats par variante */}
        <Card>
          <CardHeader>
            <CardTitle>Performance par variante</CardTitle>
          </CardHeader>
          <CardContent>
            {variantStats.length === 0 ? (
              <p className="text-muted-foreground">Aucune donnée</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Variante</TableHead>
                    <TableHead>Leads</TableHead>
                    <TableHead>Envoyés</TableHead>
                    <TableHead>Taux</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {variantStats.map((stat) => (
                    <TableRow key={stat.variant}>
                      <TableCell>
                        <Badge variant="outline">{stat.variant.toUpperCase()}</Badge>
                      </TableCell>
                      <TableCell>{formatNumber(stat.leads)}</TableCell>
                      <TableCell>{formatNumber(stat.sent)}</TableCell>
                      <TableCell>{formatPercent(stat.conversion)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Stats par client */}
        <Card>
          <CardHeader>
            <CardTitle>Distribution par client</CardTitle>
          </CardHeader>
          <CardContent>
            {clientStatsArray.length === 0 ? (
              <p className="text-muted-foreground">Aucune donnée</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Client</TableHead>
                    <TableHead>Leads</TableHead>
                    <TableHead>%</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {clientStatsArray.map((stat) => (
                    <TableRow key={stat.client}>
                      <TableCell className="font-medium">{stat.client}</TableCell>
                      <TableCell>{formatNumber(stat.leads)}</TableCell>
                      <TableCell>{formatPercent(stat.percentage)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Derniers leads */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Derniers leads</CardTitle>
        </CardHeader>
        <CardContent>
          {recentLeads.length === 0 ? (
            <p className="text-muted-foreground">Aucun lead</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Variante</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentLeads.map((lead) => (
                  <TableRow key={lead.id}>
                    <TableCell className="text-sm">
                      {formatDateTime(lead.created_at)}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{lead.variant.toUpperCase()}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-xs">
                        {lead.data.firstName && (
                          <div className="font-medium">{lead.data.firstName}</div>
                        )}
                        {lead.data.email && (
                          <div className="text-sm text-muted-foreground">
                            {lead.data.email}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {lead.sent_to_client || <span className="text-muted-foreground">-</span>}
                    </TableCell>
                    <TableCell>
                      <Badge className={statusStyles[lead.status]}>
                        {lead.status === 'pending' && 'En attente'}
                        {lead.status === 'sent' && 'Envoyé'}
                        {lead.status === 'accepted' && 'Accepté'}
                        {lead.status === 'rejected' && 'Rejeté'}
                        {lead.status === 'error' && 'Erreur'}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

