import { createClient } from '@/lib/supabase/server';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { statusStyles, formatDateTime } from '@/lib/utils';
import type { Lead } from '@/types';

export const dynamic = 'force-dynamic';

async function getLeads(): Promise<Lead[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('leads')
    .select('*, funnels(name, slug)')
    .order('created_at', { ascending: false })
    .limit(100);

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
  const sentLeads = leads.filter((l) => l.status === 'sent').length;
  const errorLeads = leads.filter((l) => l.status === 'error').length;

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Leads</h1>
        <p className="text-muted-foreground">
          Tous les leads collectés via vos funnels
        </p>
      </div>

      <div className="mb-6 grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalLeads}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Envoyés</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{sentLeads}</div>
            <p className="text-xs text-muted-foreground">
              {totalLeads > 0 ? Math.round((sentLeads / totalLeads) * 100) : 0}%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Erreurs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{errorLeads}</div>
            <p className="text-xs text-muted-foreground">
              {totalLeads > 0 ? Math.round((errorLeads / totalLeads) * 100) : 0}%
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Liste des leads</CardTitle>
          <CardDescription>
            Les 100 derniers leads collectés
          </CardDescription>
        </CardHeader>
        <CardContent>
          {leads.length === 0 ? (
            <p className="py-8 text-center text-muted-foreground">
              Aucun lead pour le moment
            </p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Funnel</TableHead>
                    <TableHead>Variante</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leads.map((lead) => (
                    <TableRow key={lead.id}>
                      <TableCell className="text-sm">
                        {formatDateTime(lead.created_at)}
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{lead.funnels?.name}</div>
                        <div className="text-xs text-muted-foreground font-mono">
                          /{lead.funnels?.slug}
                        </div>
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
                        {lead.sent_to_client ? (
                          <div className="text-sm">{lead.sent_to_client}</div>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge className={statusStyles[lead.status]}>
                          {lead.status === 'pending' && 'En attente'}
                          {lead.status === 'sent' && 'Envoyé'}
                          {lead.status === 'accepted' && 'Accepté'}
                          {lead.status === 'rejected' && 'Rejeté'}
                          {lead.status === 'error' && 'Erreur'}
                        </Badge>
                        {lead.error_message && (
                          <div className="mt-1 text-xs text-red-600">
                            {lead.error_message}
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

