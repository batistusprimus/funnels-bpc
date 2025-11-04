'use client';

import { useState, useMemo } from 'react';
import { Input } from './input';
import { Button } from './button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './table';
import { ArrowUpDown, Search, X } from 'lucide-react';

export interface Column<T> {
  key: string;
  label: string;
  sortable?: boolean;
  filterable?: boolean;
  filterType?: 'text' | 'select';
  filterOptions?: { value: string; label: string }[];
  render?: (row: T) => React.ReactNode;
  accessor?: (row: T) => any;
}

export interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  searchable?: boolean;
  searchPlaceholder?: string;
  emptyState?: React.ReactNode;
}

export function DataTable<T extends Record<string, any>>({
  data,
  columns,
  searchable = true,
  searchPlaceholder = 'Rechercher...',
  emptyState,
}: DataTableProps<T>) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: 'asc' | 'desc';
  } | null>(null);
  const [filters, setFilters] = useState<Record<string, string>>({});

  const handleSort = (key: string) => {
    setSortConfig((current) => {
      if (current?.key === key) {
        return {
          key,
          direction: current.direction === 'asc' ? 'desc' : 'asc',
        };
      }
      return { key, direction: 'asc' };
    });
  };

  const handleFilter = (key: string, value: string) => {
    setFilters((current) => {
      if (!value) {
        const { [key]: _, ...rest } = current;
        return rest;
      }
      return { ...current, [key]: value };
    });
  };

  const filteredAndSortedData = useMemo(() => {
    let result = [...data];

    // Filtrage par recherche
    if (searchable && searchTerm) {
      result = result.filter((row) =>
        Object.values(row).some((value) =>
          String(value).toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    // Filtrage par colonnes
    Object.entries(filters).forEach(([key, value]) => {
      const column = columns.find((col) => col.key === key);
      if (column && value) {
        result = result.filter((row) => {
          const cellValue = column.accessor
            ? column.accessor(row)
            : row[key];
          return String(cellValue).toLowerCase().includes(value.toLowerCase());
        });
      }
    });

    // Tri
    if (sortConfig) {
      result.sort((a, b) => {
        const column = columns.find((col) => col.key === sortConfig.key);
        const aValue = column?.accessor ? column.accessor(a) : a[sortConfig.key];
        const bValue = column?.accessor ? column.accessor(b) : b[sortConfig.key];

        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    return result;
  }, [data, searchTerm, sortConfig, filters, columns, searchable]);

  const hasActiveFilters = searchTerm || Object.keys(filters).length > 0;
  const showEmptyState = filteredAndSortedData.length === 0;

  return (
    <div className="space-y-4">
      {/* Barre de recherche et filtres */}
      <div className="flex flex-col gap-4">
        {searchable && (
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={searchPlaceholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        )}

        {/* Filtres de colonnes */}
        <div className="flex flex-wrap gap-2">
          {columns
            .filter((col) => col.filterable)
            .map((col) => (
              <div key={col.key} className="min-w-[200px]">
                {col.filterType === 'select' && col.filterOptions ? (
                  <Select
                    value={filters[col.key] || '__all__'}
                    onValueChange={(value) => handleFilter(col.key, value === '__all__' ? '' : value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={`Filtrer ${col.label}`} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__all__">Tous</SelectItem>
                      {col.filterOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    placeholder={`Filtrer ${col.label}...`}
                    value={filters[col.key] || ''}
                    onChange={(e) => handleFilter(col.key, e.target.value)}
                  />
                )}
              </div>
            ))}
          {hasActiveFilters && (
            <Button
              variant="ghost"
              onClick={() => {
                setSearchTerm('');
                setFilters({});
                setSortConfig(null);
              }}
              size="sm"
            >
              Réinitialiser
            </Button>
          )}
        </div>
      </div>

      {/* Tableau */}
      {showEmptyState ? (
        <div className="border rounded-lg">
          {emptyState || (
            <div className="py-16 text-center text-muted-foreground">
              {hasActiveFilters ? 'Aucun résultat trouvé' : 'Aucune donnée'}
            </div>
          )}
        </div>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  {columns.map((column) => (
                    <TableHead key={column.key}>
                      {column.sortable ? (
                        <button
                          onClick={() => handleSort(column.key)}
                          className="flex items-center gap-2 font-medium hover:text-foreground"
                        >
                          {column.label}
                          <ArrowUpDown className="h-4 w-4" />
                        </button>
                      ) : (
                        <span className="font-medium">{column.label}</span>
                      )}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAndSortedData.map((row, index) => (
                  <TableRow key={index}>
                    {columns.map((column) => (
                      <TableCell key={column.key}>
                        {column.render
                          ? column.render(row)
                          : column.accessor
                          ? column.accessor(row)
                          : row[column.key]}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {/* Info */}
      <div className="text-sm text-muted-foreground">
        {filteredAndSortedData.length} résultat(s)
        {data.length !== filteredAndSortedData.length &&
          ` sur ${data.length} total`}
      </div>
    </div>
  );
}

