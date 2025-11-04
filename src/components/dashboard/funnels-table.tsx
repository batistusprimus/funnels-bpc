'use client';

import Link from 'next/link';
import { DataTable, Column } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { statusStyles, formatDate } from '@/lib/utils';
import type { Funnel, FunnelStatus } from '@/types';
import { ExternalLink, Edit, Tag } from 'lucide-react';

interface FunnelWithStats extends Funnel {
  leadsCount: number;
}

interface FunnelsTableProps {
  funnels: FunnelWithStats[];
}

export function FunnelsTable({ funnels }: FunnelsTableProps) {
  const columns: Column<FunnelWithStats>[] = [
    {
      key: 'name',
      label: 'Nom',
      sortable: true,
      filterable: true,
      render: (funnel) => (
        <div>
          <div className="font-medium">{funnel.name}</div>
          <div className="text-xs text-muted-foreground font-mono">
            /{funnel.slug}
          </div>
        </div>
      ),
    },
    {
      key: 'description',
      label: 'Description',
      render: (funnel) => (
        <div className="max-w-md text-sm text-muted-foreground line-clamp-2">
          {funnel.description || '-'}
        </div>
      ),
    },
    {
      key: 'tags',
      label: 'Tags',
      filterable: true,
      accessor: (funnel) => funnel.tags?.join(', ') || '',
      render: (funnel) => (
        <div className="flex flex-wrap gap-1 max-w-xs">
          {funnel.tags && funnel.tags.length > 0 ? (
            funnel.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                <Tag className="mr-1 h-3 w-3" />
                {tag}
              </Badge>
            ))
          ) : (
            <span className="text-muted-foreground text-sm">-</span>
          )}
          {funnel.tags && funnel.tags.length > 3 && (
            <Badge variant="outline" className="text-xs">
              +{funnel.tags.length - 3}
            </Badge>
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
        { value: 'draft', label: 'Brouillon' },
        { value: 'active', label: 'Actif' },
        { value: 'archived', label: 'Archivé' },
      ],
      accessor: (funnel) => funnel.status,
      render: (funnel) => (
        <Badge className={statusStyles[funnel.status]}>
          {funnel.status === 'draft' && 'Brouillon'}
          {funnel.status === 'active' && 'Actif'}
          {funnel.status === 'archived' && 'Archivé'}
        </Badge>
      ),
    },
    {
      key: 'leadsCount',
      label: 'Leads',
      sortable: true,
      accessor: (funnel) => funnel.leadsCount,
      render: (funnel) => (
        <div className="font-semibold tabular-nums">{funnel.leadsCount}</div>
      ),
    },
    {
      key: 'domain',
      label: 'Domaine',
      render: (funnel) => (
        <div className="text-sm">
          {funnel.domain ? (
            <a
              href={`https://${funnel.domain}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline inline-flex items-center gap-1"
            >
              {funnel.domain}
              <ExternalLink className="h-3 w-3" />
            </a>
          ) : (
            <span className="text-muted-foreground">-</span>
          )}
        </div>
      ),
    },
    {
      key: 'created_at',
      label: 'Création',
      sortable: true,
      accessor: (funnel) => funnel.created_at,
      render: (funnel) => (
        <div className="text-sm text-muted-foreground">
          {formatDate(funnel.created_at)}
        </div>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (funnel) => (
        <div className="flex gap-2">
          <Button asChild variant="outline" size="sm">
            <Link href={`/funnels/${funnel.id}`}>Voir</Link>
          </Button>
          <Button asChild size="sm">
            <Link href={`/funnels/${funnel.id}/builder`}>
              <Edit className="h-4 w-4 mr-1" />
              Éditer
            </Link>
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="p-6">
      <DataTable
        data={funnels}
        columns={columns}
        searchPlaceholder="Rechercher un funnel..."
      />
    </div>
  );
}

