'use client';

import { DataTable, Column } from '@/components/ui/data-table';
import { Badge } from '@/components/ui/badge';
import { statusStyles, formatDateTime } from '@/lib/utils';
import type { Lead } from '@/types';

interface LeadsTableProps {
  leads: Lead[];
}

export function LeadsTable({ leads }: LeadsTableProps) {
  const columns: Column<Lead>[] = [
    {
      key: 'created_at',
      label: 'Date',
      sortable: true,
      accessor: (lead) => lead.created_at,
      render: (lead) => (
        <div className="text-sm whitespace-nowrap">
          {formatDateTime(lead.created_at)}
        </div>
      ),
    },
    {
      key: 'funnel',
      label: 'Funnel',
      sortable: true,
      filterable: true,
      accessor: (lead) => lead.funnels?.name || '',
      render: (lead) => (
        <div>
          <div className="font-medium">{lead.funnels?.name}</div>
          <div className="text-xs text-muted-foreground font-mono">
            /{lead.funnels?.slug}
          </div>
        </div>
      ),
    },
    {
      key: 'variant',
      label: 'Variante',
      sortable: true,
      filterable: true,
      filterType: 'select',
      filterOptions: [
        { value: 'a', label: 'A' },
        { value: 'b', label: 'B' },
        { value: 'c', label: 'C' },
      ],
      accessor: (lead) => lead.variant,
      render: (lead) => (
        <Badge variant="outline">{lead.variant.toUpperCase()}</Badge>
      ),
    },
    {
      key: 'contact',
      label: 'Contact',
      filterable: true,
      accessor: (lead) => {
        const parts = [];
        if (lead.data.firstName) parts.push(lead.data.firstName);
        if (lead.data.lastName) parts.push(lead.data.lastName);
        if (lead.data.email) parts.push(lead.data.email);
        return parts.join(' ');
      },
      render: (lead) => (
        <div className="max-w-xs">
          {(lead.data.firstName || lead.data.lastName) && (
            <div className="font-medium">
              {lead.data.firstName} {lead.data.lastName}
            </div>
          )}
          {lead.data.email && (
            <div className="text-sm text-muted-foreground">
              {lead.data.email}
            </div>
          )}
          {lead.data.phone && (
            <div className="text-xs text-muted-foreground">
              {lead.data.phone}
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'client',
      label: 'Client',
      filterable: true,
      accessor: (lead) => lead.sent_to_client || '',
      render: (lead) => (
        <div className="text-sm">
          {lead.sent_to_client ? (
            lead.sent_to_client
          ) : (
            <span className="text-muted-foreground">-</span>
          )}
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Statut',
      sortable: true,
      filterable: true,
      filterType: 'select',
      filterOptions: [
        { value: 'pending', label: 'En attente' },
        { value: 'sent', label: 'Envoyé' },
        { value: 'accepted', label: 'Accepté' },
        { value: 'rejected', label: 'Rejeté' },
        { value: 'error', label: 'Erreur' },
      ],
      accessor: (lead) => lead.status,
      render: (lead) => (
        <div>
          <Badge className={statusStyles[lead.status]}>
            {lead.status === 'pending' && 'En attente'}
            {lead.status === 'sent' && 'Envoyé'}
            {lead.status === 'accepted' && 'Accepté'}
            {lead.status === 'rejected' && 'Rejeté'}
            {lead.status === 'error' && 'Erreur'}
          </Badge>
          {lead.error_message && (
            <div className="mt-1 text-xs text-red-600 max-w-xs truncate" title={lead.error_message}>
              {lead.error_message}
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'utm',
      label: 'UTM Source',
      filterable: true,
      accessor: (lead) => lead.utm_params?.utm_source || '',
      render: (lead) => (
        <div className="text-sm">
          {lead.utm_params?.utm_source ? (
            <Badge variant="secondary" className="text-xs">
              {lead.utm_params.utm_source}
            </Badge>
          ) : (
            <span className="text-muted-foreground">-</span>
          )}
        </div>
      ),
    },
  ];

  return (
    <DataTable
      data={leads}
      columns={columns}
      searchPlaceholder="Rechercher un lead (nom, email, funnel...)..."
    />
  );
}

