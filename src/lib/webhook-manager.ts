/**
 * Webhook Manager - Système avancé de webhooks
 * Fonctionnalités: retry logic, logs détaillés, custom headers, replay manuel
 */

import { createClient } from '@supabase/supabase-js';

// Types
export interface WebhookConfig {
  id: string;
  routing_rule_id: string;
  custom_headers: Record<string, string>;
  timeout_ms: number;
  retry_enabled: boolean;
  max_retries: number;
  retry_delay_ms: number;
  retry_backoff_multiplier: number;
}

export interface WebhookLog {
  id: string;
  lead_id: string;
  routing_rule_id: string;
  webhook_url: string;
  request_headers: Record<string, string>;
  request_body: any;
  response_status?: number;
  response_headers?: Record<string, string>;
  response_body?: string;
  duration_ms?: number;
  attempt_number: number;
  max_attempts: number;
  is_retry: boolean;
  parent_log_id?: string;
  status: 'pending' | 'success' | 'failed' | 'retrying';
  error_message?: string;
  error_type?: 'timeout' | 'network' | 'http_error' | 'invalid_response';
  created_at: string;
}

export interface SendWebhookOptions {
  lead_id: string;
  routing_rule_id: string;
  webhook_url: string;
  payload: any;
  config?: Partial<WebhookConfig>;
  is_retry?: boolean;
  parent_log_id?: string;
  attempt_number?: number;
}

export interface WebhookStats {
  total_calls: number;
  success_calls: number;
  failed_calls: number;
  avg_duration_ms: number;
  success_rate: number;
}

// Classe principale du gestionnaire de webhooks
export class WebhookManager {
  private supabase: ReturnType<typeof createClient>;
  
  constructor(supabaseUrl: string, supabaseKey: string) {
    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  /**
   * Envoie un webhook avec retry automatique
   */
  async sendWebhook(options: SendWebhookOptions): Promise<WebhookLog> {
    const {
      lead_id,
      routing_rule_id,
      webhook_url,
      payload,
      config,
      is_retry = false,
      parent_log_id,
      attempt_number = 1,
    } = options;

    // Récupérer la config du webhook
    const webhookConfig = await this.getWebhookConfig(routing_rule_id, config);
    
    // Préparer les headers
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'User-Agent': 'BPC-Funnels/2.0',
      'X-Lead-ID': lead_id,
      'X-Funnel-Webhook': 'true',
      ...webhookConfig.custom_headers,
    };

    // Créer le log initial
    const logData: Partial<WebhookLog> = {
      lead_id,
      routing_rule_id,
      webhook_url,
      request_headers: headers,
      request_body: payload,
      attempt_number,
      max_attempts: webhookConfig.max_retries + 1,
      is_retry,
      parent_log_id,
      status: 'pending',
    };

    const { data: log, error: logError } = await this.supabase
      .from('webhook_logs')
      .insert(logData)
      .select()
      .single();

    if (logError || !log) {
      throw new Error(`Failed to create webhook log: ${logError?.message}`);
    }

    const startTime = Date.now();
    let webhookLog = log as WebhookLog;

    try {
      // Envoyer la requête avec timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), webhookConfig.timeout_ms);

      const response = await fetch(webhook_url, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const duration_ms = Date.now() - startTime;
      const response_body = await response.text();
      
      // Parser response headers
      const response_headers: Record<string, string> = {};
      response.headers.forEach((value, key) => {
        response_headers[key] = value;
      });

      // Déterminer le status
      const isSuccess = response.status >= 200 && response.status < 300;
      const status = isSuccess ? 'success' : 'failed';

      // Mettre à jour le log
      webhookLog = await this.updateWebhookLog(log.id, {
        response_status: response.status,
        response_headers,
        response_body: response_body.substring(0, 10000), // Limiter la taille
        duration_ms,
        status,
        error_message: !isSuccess ? `HTTP ${response.status}: ${response.statusText}` : undefined,
        error_type: !isSuccess ? 'http_error' : undefined,
      });

      // Si échec et retry activé, planifier un retry
      if (!isSuccess && webhookConfig.retry_enabled && attempt_number < webhookConfig.max_retries + 1) {
        await this.scheduleRetry(options, webhookConfig, log.id);
      }

      return webhookLog;

    } catch (error: any) {
      const duration_ms = Date.now() - startTime;
      
      // Déterminer le type d'erreur
      let error_type: WebhookLog['error_type'] = 'network';
      let error_message = error.message || 'Unknown error';

      if (error.name === 'AbortError') {
        error_type = 'timeout';
        error_message = `Request timeout after ${webhookConfig.timeout_ms}ms`;
      }

      // Mettre à jour le log avec l'erreur
      webhookLog = await this.updateWebhookLog(log.id, {
        duration_ms,
        status: 'failed',
        error_message,
        error_type,
      });

      // Retry si activé
      if (webhookConfig.retry_enabled && attempt_number < webhookConfig.max_retries + 1) {
        await this.scheduleRetry(options, webhookConfig, log.id);
      }

      return webhookLog;
    }
  }

  /**
   * Planifie un retry avec backoff exponentiel
   */
  private async scheduleRetry(
    originalOptions: SendWebhookOptions,
    config: WebhookConfig,
    parent_log_id: string
  ): Promise<void> {
    const attempt_number = (originalOptions.attempt_number || 1) + 1;
    const delay_ms = config.retry_delay_ms * Math.pow(config.retry_backoff_multiplier, attempt_number - 2);

    // Ajouter à la queue
    await this.supabase.from('webhook_queue').insert({
      lead_id: originalOptions.lead_id,
      routing_rule_id: originalOptions.routing_rule_id,
      webhook_log_id: parent_log_id,
      status: 'pending',
      priority: attempt_number, // Plus d'échecs = moins de priorité
      attempt_number,
      max_attempts: config.max_retries + 1,
      scheduled_at: new Date(Date.now() + delay_ms).toISOString(),
    });

    // Mettre à jour le log parent
    await this.updateWebhookLog(parent_log_id, {
      status: 'retrying',
    });
  }

  /**
   * Process la queue des webhooks (à appeler via cron)
   */
  async processQueue(): Promise<void> {
    // Récupérer les webhooks à envoyer
    const { data: queue, error } = await this.supabase
      .from('webhook_queue')
      .select(`
        *,
        leads (id, data, funnel_id),
        routing_rules (id, webhook_url)
      `)
      .eq('status', 'pending')
      .lte('scheduled_at', new Date().toISOString())
      .order('priority', { ascending: true })
      .order('scheduled_at', { ascending: true })
      .limit(10);

    if (error || !queue) {
      console.error('Failed to fetch webhook queue:', error);
      return;
    }

    // Traiter chaque webhook
    for (const item of queue) {
      // Marquer comme en cours
      await this.supabase
        .from('webhook_queue')
        .update({ status: 'processing', started_at: new Date().toISOString() })
        .eq('id', item.id);

      try {
        // Envoyer le webhook
        await this.sendWebhook({
          lead_id: item.lead_id,
          routing_rule_id: item.routing_rule_id,
          webhook_url: item.routing_rules.webhook_url,
          payload: item.leads.data,
          is_retry: true,
          parent_log_id: item.webhook_log_id,
          attempt_number: item.attempt_number,
        });

        // Marquer comme complété
        await this.supabase
          .from('webhook_queue')
          .update({ status: 'completed', completed_at: new Date().toISOString() })
          .eq('id', item.id);

      } catch (error: any) {
        // Marquer comme échoué
        await this.supabase
          .from('webhook_queue')
          .update({ 
            status: 'failed', 
            completed_at: new Date().toISOString(),
            error_message: error.message 
          })
          .eq('id', item.id);
      }
    }
  }

  /**
   * Replay manuel d'un webhook
   */
  async replayWebhook(log_id: string): Promise<WebhookLog> {
    // Récupérer le log original
    const { data: originalLog, error } = await this.supabase
      .from('webhook_logs')
      .select('*')
      .eq('id', log_id)
      .single();

    if (error || !originalLog) {
      throw new Error(`Webhook log not found: ${log_id}`);
    }

    // Renvoyer avec les mêmes paramètres
    return this.sendWebhook({
      lead_id: originalLog.lead_id,
      routing_rule_id: originalLog.routing_rule_id,
      webhook_url: originalLog.webhook_url,
      payload: originalLog.request_body,
      is_retry: true,
      parent_log_id: log_id,
      attempt_number: originalLog.attempt_number + 1,
    });
  }

  /**
   * Obtenir les statistiques d'un webhook
   */
  async getWebhookStats(routing_rule_id: string, days: number = 7): Promise<WebhookStats> {
    const { data, error } = await this.supabase
      .rpc('get_webhook_stats', {
        p_routing_rule_id: routing_rule_id,
        p_days: days,
      });

    if (error || !data || data.length === 0) {
      return {
        total_calls: 0,
        success_calls: 0,
        failed_calls: 0,
        avg_duration_ms: 0,
        success_rate: 0,
      };
    }

    return data[0];
  }

  /**
   * Obtenir les logs d'un webhook
   */
  async getWebhookLogs(
    routing_rule_id: string,
    options?: {
      limit?: number;
      offset?: number;
      status?: WebhookLog['status'];
    }
  ): Promise<{ logs: WebhookLog[]; total: number }> {
    let query = this.supabase
      .from('webhook_logs')
      .select('*', { count: 'exact' })
      .eq('routing_rule_id', routing_rule_id)
      .order('created_at', { ascending: false });

    if (options?.status) {
      query = query.eq('status', options.status);
    }

    if (options?.limit) {
      query = query.limit(options.limit);
    }

    if (options?.offset) {
      query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
    }

    const { data, count, error } = await query;

    if (error) {
      throw new Error(`Failed to fetch webhook logs: ${error.message}`);
    }

    return {
      logs: (data || []) as WebhookLog[],
      total: count || 0,
    };
  }

  /**
   * Obtenir la config d'un webhook
   */
  private async getWebhookConfig(
    routing_rule_id: string,
    overrides?: Partial<WebhookConfig>
  ): Promise<WebhookConfig> {
    let { data, error } = await this.supabase
      .from('webhook_configs')
      .select('*')
      .eq('routing_rule_id', routing_rule_id)
      .single();

    if (error || !data) {
      // Créer une config par défaut
      const { data: newConfig } = await this.supabase
        .from('webhook_configs')
        .insert({ routing_rule_id })
        .select()
        .single();

      data = newConfig;
    }

    return {
      ...data,
      ...overrides,
    } as WebhookConfig;
  }

  /**
   * Mettre à jour un log de webhook
   */
  private async updateWebhookLog(
    log_id: string,
    updates: Partial<WebhookLog>
  ): Promise<WebhookLog> {
    const { data, error } = await this.supabase
      .from('webhook_logs')
      .update(updates)
      .eq('id', log_id)
      .select()
      .single();

    if (error || !data) {
      throw new Error(`Failed to update webhook log: ${error?.message}`);
    }

    return data as WebhookLog;
  }

  /**
   * Sauvegarder/Mettre à jour la config d'un webhook
   */
  async updateWebhookConfig(
    routing_rule_id: string,
    config: Partial<WebhookConfig>
  ): Promise<WebhookConfig> {
    const { data, error } = await this.supabase
      .from('webhook_configs')
      .upsert({
        routing_rule_id,
        ...config,
      })
      .select()
      .single();

    if (error || !data) {
      throw new Error(`Failed to update webhook config: ${error?.message}`);
    }

    return data as WebhookConfig;
  }
}

// Export d'une instance singleton (pour usage serveur)
let webhookManager: WebhookManager | null = null;

export function getWebhookManager(): WebhookManager {
  if (!webhookManager) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    webhookManager = new WebhookManager(supabaseUrl, supabaseKey);
  }
  return webhookManager;
}

