import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LeadsTable } from '@/components/dashboard/leads-table';
import { EmptyState, EmptyLeadsIllustration } from '@/components/ui/empty-state';
import type { Lead } from '@/types';
import { TrendingUp, TrendingDown, Users } from 'lucide-react';

export const dynamic = 'force-dynamic';

async function getLeads(): Promise<Lead[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('leads')
    .select('*, funnels(name, slug)')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching leads:', error);
    return [];
  }

  return data as Lead[];
}

export default async function LeadsPage() {
  const leads = await getLeads();

  // Calculer les stats
  const totalLeads = leads.length;
  const sentLeads = leads.filter((l) => l.status === 'sent' || l.status === 'accepted').length;
  const errorLeads = leads.filter((l) => l.status === 'error').length;
  const successRate = totalLeads > 0 ? Math.round((sentLeads / totalLeads) * 100) : 0;
  const errorRate = totalLeads > 0 ? Math.round((errorLeads / totalLeads) * 100) : 0;

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Leads</h1>
        <p className="text-muted-foreground">
          Tous les leads collectés via vos funnels
        </p>
      </div>

      {/* Stats Cards */}
      <div className="mb-6 grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalLeads}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Leads collectés au total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taux de réussite</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{successRate}%</div>
            <p className="text-xs text-muted-foreground mt-1">
              {sentLeads} leads envoyés avec succès
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taux d&apos;erreur</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{errorRate}%</div>
            <p className="text-xs text-muted-foreground mt-1">
              {errorLeads} leads en erreur
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Leads Table */}
      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle>Liste des leads</CardTitle>
        </CardHeader>
        <CardContent>
          {leads.length === 0 ? (
            <EmptyState
              icon={<EmptyLeadsIllustration />}
              title="Aucun lead pour le moment"
              description="Les leads collectés via vos funnels apparaîtront ici"
            />
          ) : (
            <LeadsTable leads={leads} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

