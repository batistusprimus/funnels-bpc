'use client';

/**
 * Page de gestion des webhooks d'un funnel
 * - Configuration des webhooks
 * - Logs détaillés
 * - Statistiques
 * - Replay manuel
 */

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PageLoader } from '@/components/ui/loading';
import { toast } from 'sonner';
import { 
  Activity, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  RotateCw, 
  Settings, 
  TrendingUp,
  AlertCircle,
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface WebhookConfig {
  id: string;
  routing_rule_id: string;
  custom_headers: Record<string, string>;
  timeout_ms: number;
  retry_enabled: boolean;
  max_retries: number;
  retry_delay_ms: number;
  retry_backoff_multiplier: number;
}

interface WebhookLog {
  id: string;
  lead_id: string;
  webhook_url: string;
  request_body: any;
  response_status: number | null;
  response_body: string | null;
  duration_ms: number | null;
  attempt_number: number;
  max_attempts: number;
  status: 'pending' | 'success' | 'failed' | 'retrying';
  error_message: string | null;
  error_type: string | null;
  created_at: string;
}

interface WebhookStats {
  total_calls: number;
  success_calls: number;
  failed_calls: number;
  avg_duration_ms: number;
  success_rate: number;
}

interface RoutingRule {
  id: string;
  webhook_url: string;
  client_name: string;
  priority: number;
  is_active: boolean;
}

export default function WebhooksPage() {
  const params = useParams();
  const funnelId = params.id as string;
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [routingRules, setRoutingRules] = useState<RoutingRule[]>([]);
  const [selectedRule, setSelectedRule] = useState<string | null>(null);
  const [webhookConfig, setWebhookConfig] = useState<WebhookConfig | null>(null);
  const [webhookLogs, setWebhookLogs] = useState<WebhookLog[]>([]);
  const [webhookStats, setWebhookStats] = useState<WebhookStats | null>(null);
  const [customHeaders, setCustomHeaders] = useState<Record<string, string>>({});

  // Charger les règles de routage
  useEffect(() => {
    loadRoutingRules();
  }, [funnelId]);

  // Charger la config et les logs quand une règle est sélectionnée
  useEffect(() => {
    if (selectedRule) {
      loadWebhookConfig(selectedRule);
      loadWebhookLogs(selectedRule);
      loadWebhookStats(selectedRule);
    }
  }, [selectedRule]);

  async function loadRoutingRules() {
    setLoading(true);
    const { data, error } = await supabase
      .from('routing_rules')
      .select('*')
      .eq('funnel_id', funnelId)
      .order('priority');

    if (error) {
      toast.error('Erreur lors du chargement des règles de routage');
      console.error(error);
    } else if (data && data.length > 0) {
      const rules: RoutingRule[] = data.map((rule) => ({
        id: rule.id,
        webhook_url: rule.webhook_url,
        client_name: rule.client_name,
        priority: rule.priority,
        is_active: rule.is_active,
      }));

      setRoutingRules(rules);
      setSelectedRule(rules[0]?.id ?? null);
    }
    setLoading(false);
  }

  async function loadWebhookConfig(ruleId: string) {
    const { data, error } = await supabase
      .from('webhook_configs')
      .select('*')
      .eq('routing_rule_id', ruleId)
      .single();

    if (data) {
      const config: WebhookConfig = {
        id: data.id,
        routing_rule_id: data.routing_rule_id,
        custom_headers: data.custom_headers || {},
        timeout_ms: data.timeout_ms,
        retry_enabled: data.retry_enabled,
        max_retries: data.max_retries,
        retry_delay_ms: data.retry_delay_ms,
        retry_backoff_multiplier: data.retry_backoff_multiplier,
      };

      setWebhookConfig(config);
      setCustomHeaders(config.custom_headers);
    } else if (error) {
      // Créer une config par défaut
      const { data: newConfig } = await supabase
        .from('webhook_configs')
        .insert({
          routing_rule_id: ruleId,
          custom_headers: {},
          timeout_ms: 10000,
          retry_enabled: true,
          max_retries: 3,
          retry_delay_ms: 1000,
          retry_backoff_multiplier: 2.0,
        })
        .select()
        .single();
      
      if (newConfig) {
        const config: WebhookConfig = {
          id: newConfig.id,
          routing_rule_id: newConfig.routing_rule_id,
          custom_headers: newConfig.custom_headers || {},
          timeout_ms: newConfig.timeout_ms,
          retry_enabled: newConfig.retry_enabled,
          max_retries: newConfig.max_retries,
          retry_delay_ms: newConfig.retry_delay_ms,
          retry_backoff_multiplier: newConfig.retry_backoff_multiplier,
        };

        setWebhookConfig(config);
        setCustomHeaders(config.custom_headers);
      }
    }
  }

  async function loadWebhookLogs(ruleId: string) {
    const { data, error } = await supabase
      .from('webhook_logs')
      .select('*')
      .eq('routing_rule_id', ruleId)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      toast.error('Erreur lors du chargement des logs');
      console.error(error);
    } else {
      setWebhookLogs((data || []) as WebhookLog[]);
    }
  }

  async function loadWebhookStats(ruleId: string) {
    const { data, error } = await supabase
      .rpc('get_webhook_stats', {
        p_routing_rule_id: ruleId,
        p_days: 7,
      });

    if (error) {
      console.error('Erreur stats:', error);
    } else if (data && data.length > 0) {
      setWebhookStats(data[0]);
    }
  }

  async function saveWebhookConfig() {
    if (!webhookConfig) return;

    const { error } = await supabase
      .from('webhook_configs')
      .update({
        custom_headers: customHeaders,
        timeout_ms: webhookConfig.timeout_ms,
        retry_enabled: webhookConfig.retry_enabled,
        max_retries: webhookConfig.max_retries,
        retry_delay_ms: webhookConfig.retry_delay_ms,
        retry_backoff_multiplier: webhookConfig.retry_backoff_multiplier,
      })
      .eq('id', webhookConfig.id);

    if (error) {
      toast.error('Erreur lors de la sauvegarde');
      console.error(error);
    } else {
      toast.success('Configuration sauvegardée');
    }
  }

  async function replayWebhook(logId: string) {
    // Récupérer le log
    const log = webhookLogs.find(l => l.id === logId);
    if (!log) return;

    const rule = routingRules.find(r => r.id === selectedRule);
    if (!rule) return;

    toast.loading('Envoi du webhook...');

    try {
      // Simuler un replay en créant un nouveau log
      const { error } = await supabase
        .from('webhook_logs')
        .insert({
          lead_id: log.lead_id,
          routing_rule_id: selectedRule,
          webhook_url: rule.webhook_url,
          request_headers: { 'Content-Type': 'application/json' },
          request_body: log.request_body,
          attempt_number: log.attempt_number + 1,
          max_attempts: webhookConfig?.max_retries || 3,
          is_retry: true,
          parent_log_id: logId,
          status: 'pending',
        });

      if (error) {
        toast.error('Erreur lors du replay');
        console.error(error);
      } else {
        toast.success('Webhook rejoué avec succès');
        loadWebhookLogs(selectedRule!);
      }
    } catch (err) {
      toast.error('Erreur lors du replay');
      console.error(err);
    }
  }

  function addCustomHeader() {
    const key = prompt('Nom du header (ex: X-Custom-Header)');
    if (!key) return;
    const value = prompt('Valeur du header');
    if (!value) return;

    setCustomHeaders({
      ...customHeaders,
      [key]: value,
    });
  }

  function removeCustomHeader(key: string) {
    const { [key]: _, ...rest } = customHeaders;
    setCustomHeaders(rest);
  }

  if (loading) {
    return <PageLoader />;
  }

  if (routingRules.length === 0) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardHeader>
            <CardTitle>Aucune règle de routage</CardTitle>
            <CardDescription>
              Configurez d'abord des règles de routage dans l'onglet "Configuration du routage"
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const selectedRuleData = routingRules.find(r => r.id === selectedRule);

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Webhooks</h1>
        <p className="text-muted-foreground">
          Configuration avancée et monitoring des webhooks
        </p>
      </div>

      {/* Sélection de la règle */}
      <Card>
        <CardHeader>
          <CardTitle>Règle de routage</CardTitle>
          <CardDescription>Sélectionnez une règle pour configurer</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 flex-wrap">
            {routingRules.map((rule) => (
              <Button
                key={rule.id}
                variant={selectedRule === rule.id ? 'default' : 'outline'}
                onClick={() => setSelectedRule(rule.id)}
              >
                {rule.client_name}
                {!rule.is_active && (
                  <Badge variant="secondary" className="ml-2">Inactif</Badge>
                )}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      {webhookStats && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Total</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{webhookStats.total_calls}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                Succès
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-500">
                {webhookStats.success_calls}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <XCircle className="w-4 h-4 text-red-500" />
                Échecs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-500">
                {webhookStats.failed_calls}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Taux de succès
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {webhookStats.success_rate.toFixed(1)}%
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Durée moy.
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {Math.round(webhookStats.avg_duration_ms)}ms
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tabs */}
      <Tabs defaultValue="logs">
        <TabsList>
          <TabsTrigger value="logs">
            <Activity className="w-4 h-4 mr-2" />
            Logs
          </TabsTrigger>
          <TabsTrigger value="config">
            <Settings className="w-4 h-4 mr-2" />
            Configuration
          </TabsTrigger>
        </TabsList>

        {/* Logs */}
        <TabsContent value="logs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Historique des appels</CardTitle>
              <CardDescription>
                Derniers appels webhook pour {selectedRuleData?.client_name}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Statut</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Code HTTP</TableHead>
                    <TableHead>Durée</TableHead>
                    <TableHead>Tentative</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {webhookLogs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground">
                        Aucun log disponible
                      </TableCell>
                    </TableRow>
                  ) : (
                    webhookLogs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell>
                          {log.status === 'success' && (
                            <Badge variant="default" className="bg-green-500">
                              <CheckCircle2 className="w-3 h-3 mr-1" />
                              Succès
                            </Badge>
                          )}
                          {log.status === 'failed' && (
                            <Badge variant="destructive">
                              <XCircle className="w-3 h-3 mr-1" />
                              Échec
                            </Badge>
                          )}
                          {log.status === 'retrying' && (
                            <Badge variant="secondary">
                              <RotateCw className="w-3 h-3 mr-1" />
                              Retry
                            </Badge>
                          )}
                          {log.status === 'pending' && (
                            <Badge variant="outline">
                              <Clock className="w-3 h-3 mr-1" />
                              En cours
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {format(new Date(log.created_at), 'dd/MM/yyyy HH:mm:ss', { locale: fr })}
                        </TableCell>
                        <TableCell>
                          {log.response_status ? (
                            <code className="text-sm">{log.response_status}</code>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {log.duration_ms ? (
                            <span>{log.duration_ms}ms</span>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {log.attempt_number}/{log.max_attempts}
                        </TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => replayWebhook(log.id)}
                          >
                            <RotateCw className="w-3 h-3 mr-1" />
                            Rejouer
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Configuration */}
        <TabsContent value="config" className="space-y-4">
          {webhookConfig && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Retry Logic</CardTitle>
                  <CardDescription>
                    Configuration des tentatives en cas d'échec
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="retry_enabled"
                      checked={webhookConfig.retry_enabled}
                      onChange={(e) => setWebhookConfig({
                        ...webhookConfig,
                        retry_enabled: e.target.checked,
                      })}
                      className="w-4 h-4"
                    />
                    <Label htmlFor="retry_enabled">Activer les tentatives automatiques</Label>
                  </div>

                  {webhookConfig.retry_enabled && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Nombre max de tentatives</Label>
                        <Input
                          type="number"
                          value={webhookConfig.max_retries}
                          onChange={(e) => setWebhookConfig({
                            ...webhookConfig,
                            max_retries: parseInt(e.target.value),
                          })}
                          min={1}
                          max={10}
                        />
                      </div>

                      <div>
                        <Label>Délai initial (ms)</Label>
                        <Input
                          type="number"
                          value={webhookConfig.retry_delay_ms}
                          onChange={(e) => setWebhookConfig({
                            ...webhookConfig,
                            retry_delay_ms: parseInt(e.target.value),
                          })}
                          min={100}
                          step={100}
                        />
                      </div>

                      <div>
                        <Label>Multiplicateur backoff</Label>
                        <Input
                          type="number"
                          value={webhookConfig.retry_backoff_multiplier}
                          onChange={(e) => setWebhookConfig({
                            ...webhookConfig,
                            retry_backoff_multiplier: parseFloat(e.target.value),
                          })}
                          min={1}
                          max={5}
                          step={0.1}
                        />
                      </div>

                      <div>
                        <Label>Timeout (ms)</Label>
                        <Input
                          type="number"
                          value={webhookConfig.timeout_ms}
                          onChange={(e) => setWebhookConfig({
                            ...webhookConfig,
                            timeout_ms: parseInt(e.target.value),
                          })}
                          min={1000}
                          step={1000}
                        />
                      </div>
                    </div>
                  )}

                  <div className="bg-muted p-3 rounded-md text-sm">
                    <AlertCircle className="w-4 h-4 inline mr-2" />
                    Exemple: Avec 3 tentatives, délai 1000ms et backoff 2.0, les retries seront à 1s, 2s, 4s
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Custom Headers</CardTitle>
                  <CardDescription>
                    Headers HTTP personnalisés pour les appels webhook
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {Object.entries(customHeaders).map(([key, value]) => (
                    <div key={key} className="flex items-center gap-2">
                      <code className="flex-1 bg-muted p-2 rounded text-sm">
                        {key}: {value}
                      </code>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => removeCustomHeader(key)}
                      >
                        Supprimer
                      </Button>
                    </div>
                  ))}

                  <Button variant="outline" onClick={addCustomHeader}>
                    Ajouter un header
                  </Button>
                </CardContent>
              </Card>

              <div className="flex justify-end">
                <Button onClick={saveWebhookConfig}>
                  Sauvegarder la configuration
                </Button>
              </div>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

