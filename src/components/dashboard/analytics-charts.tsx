'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import type { Lead } from '@/types';

interface AnalyticsChartsProps {
  leads: Lead[];
}

export function AnalyticsCharts({ leads }: AnalyticsChartsProps) {
  // Données pour le line chart (évolution dans le temps)
  const timelineData = prepareTimelineData(leads);
  
  // Données pour le bar chart (comparaison des variantes)
  const variantData = prepareVariantData(leads);
  
  // Données pour le funnel
  const funnelData = prepareFunnelData(leads);

  return (
    <div className="space-y-6">
      {/* Line Chart - Évolution des leads */}
      <Card>
        <CardHeader>
          <CardTitle>Évolution des leads</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={timelineData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="leads" 
                stroke="#8884d8" 
                strokeWidth={2}
                name="Leads"
              />
              <Line 
                type="monotone" 
                dataKey="sent" 
                stroke="#82ca9d" 
                strokeWidth={2}
                name="Envoyés"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Bar Chart - Performance par variante */}
      <Card>
        <CardHeader>
          <CardTitle>Performance par variante</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={variantData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="variant" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="leads" fill="#8884d8" name="Total leads" />
              <Bar dataKey="sent" fill="#82ca9d" name="Envoyés" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Funnel Visualization */}
      <Card>
        <CardHeader>
          <CardTitle>Funnel de conversion</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart 
              data={funnelData} 
              layout="vertical"
              margin={{ left: 100 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis type="category" dataKey="stage" width={100} />
              <Tooltip 
                formatter={(value: number, name: string) => [
                  `${value} (${name})`,
                  ''
                ]}
              />
              <Bar dataKey="count" name="Nombre">
                {funnelData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={getFunnelColor(index, funnelData.length)} 
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-4 space-y-2">
            {funnelData.map((stage, index) => {
              const prevStage = index > 0 ? funnelData[index - 1] : null;
              const dropRate = prevStage 
                ? ((prevStage.count - stage.count) / prevStage.count) * 100 
                : 0;
              
              return (
                <div key={stage.stage} className="flex items-center justify-between text-sm">
                  <span className="font-medium">{stage.stage}</span>
                  <div className="flex items-center gap-4">
                    <span>{stage.count} leads</span>
                    {prevStage && (
                      <span className="text-red-600">
                        -{dropRate.toFixed(1)}% vs étape précédente
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Préparer les données pour le timeline
function prepareTimelineData(leads: Lead[]) {
  const dataByDate: Record<string, { leads: number; sent: number }> = {};
  
  leads.forEach((lead) => {
    const date = new Date(lead.created_at).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
    });
    
    if (!dataByDate[date]) {
      dataByDate[date] = { leads: 0, sent: 0 };
    }
    
    dataByDate[date].leads++;
    if (lead.status === 'sent') {
      dataByDate[date].sent++;
    }
  });
  
  return Object.entries(dataByDate)
    .map(([date, data]) => ({
      date,
      leads: data.leads,
      sent: data.sent,
    }))
    .slice(-30); // Derniers 30 jours
}

// Préparer les données pour les variantes
function prepareVariantData(leads: Lead[]) {
  const dataByVariant: Record<string, { leads: number; sent: number }> = {};
  
  leads.forEach((lead) => {
    const variant = lead.variant.toUpperCase();
    
    if (!dataByVariant[variant]) {
      dataByVariant[variant] = { leads: 0, sent: 0 };
    }
    
    dataByVariant[variant].leads++;
    if (lead.status === 'sent') {
      dataByVariant[variant].sent++;
    }
  });
  
  return Object.entries(dataByVariant).map(([variant, data]) => ({
    variant,
    leads: data.leads,
    sent: data.sent,
  }));
}

// Préparer les données pour le funnel
function prepareFunnelData(leads: Lead[]) {
  const total = leads.length;
  const sent = leads.filter((l) => l.status === 'sent').length;
  const accepted = leads.filter((l) => l.status === 'accepted').length;
  
  return [
    { stage: 'Soumissions', count: total },
    { stage: 'Envoyés', count: sent },
    { stage: 'Acceptés', count: accepted },
  ];
}

// Couleurs du funnel (du vert au jaune)
function getFunnelColor(index: number, total: number) {
  const colors = ['#22c55e', '#84cc16', '#eab308', '#f59e0b'];
  return colors[Math.min(index, colors.length - 1)];
}

