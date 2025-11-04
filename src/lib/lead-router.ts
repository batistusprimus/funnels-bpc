import type { Lead, RoutingRule, RoutingCondition } from '@/types';
import { createClient as createServerClient } from '@/lib/supabase/server';

// Évaluer une condition
function evaluateCondition(condition: RoutingCondition, data: Record<string, any>): boolean {
  const { field, operator, value } = condition;
  const fieldValue = data[field];

  // Si le champ n'existe pas dans les données
  if (fieldValue === undefined || fieldValue === null) {
    return false;
  }

  switch (operator) {
    case '>':
      return Number(fieldValue) > Number(value);
    case '>=':
      return Number(fieldValue) >= Number(value);
    case '<':
      return Number(fieldValue) < Number(value);
    case '<=':
      return Number(fieldValue) <= Number(value);
    case '==':
      // eslint-disable-next-line eqeqeq
      return fieldValue == value;
    case '!=':
      // eslint-disable-next-line eqeqeq
      return fieldValue != value;
    case 'contains':
      return String(fieldValue).includes(String(value));
    case 'startsWith':
      return String(fieldValue).startsWith(String(value));
    case 'endsWith':
      return String(fieldValue).endsWith(String(value));
    default:
      return false;
  }
}

// Envoyer le lead au webhook
async function sendToWebhook(url: string, lead: Lead): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...lead.data,
        utm: lead.utm_params,
        timestamp: lead.created_at,
        funnel: lead.funnels?.slug,
        variant: lead.variant,
        lead_id: lead.id,
      }),
    });

    if (!response.ok) {
      return {
        success: false,
        error: `Webhook returned ${response.status}: ${response.statusText}`,
      };
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// Router un lead selon les règles de routage
export async function routeLead(leadId: string): Promise<{ success: boolean; client?: string; error?: string }> {
  const supabase = await createServerClient();

  // 1. Récupérer le lead avec le funnel
  const { data: lead, error: leadError } = await supabase
    .from('leads')
    .select('*, funnels(*)')
    .eq('id', leadId)
    .single();

  if (leadError || !lead) {
    return { success: false, error: 'Lead not found' };
  }

  // 2. Récupérer les règles de routage (triées par priorité)
  const { data: rules, error: rulesError } = await supabase
    .from('routing_rules')
    .select('*')
    .eq('funnel_id', lead.funnel_id)
    .eq('is_active', true)
    .order('priority', { ascending: true });

  if (rulesError) {
    return { success: false, error: 'Failed to fetch routing rules' };
  }

  // 3. Si aucune règle, retourner une erreur
  if (!rules || rules.length === 0) {
    await supabase
      .from('leads')
      .update({
        status: 'error',
        error_message: 'No routing rules defined',
      })
      .eq('id', leadId);

    return { success: false, error: 'No routing rules defined' };
  }

  // 4. Évaluer chaque règle dans l'ordre de priorité
  for (const rule of rules) {
    if (evaluateCondition(rule.condition as RoutingCondition, lead.data)) {
      // Match ! Envoyer au webhook
      const result = await sendToWebhook(rule.webhook_url, lead as Lead);

      if (result.success) {
        // Mise à jour du lead avec succès
        await supabase
          .from('leads')
          .update({
            sent_to: rule.webhook_url,
            sent_to_client: rule.client_name,
            status: 'sent',
            sent_at: new Date().toISOString(),
          })
          .eq('id', leadId);

        return { success: true, client: rule.client_name };
      } else {
        // Erreur d'envoi
        await supabase
          .from('leads')
          .update({
            status: 'error',
            error_message: result.error,
          })
          .eq('id', leadId);

        return { success: false, error: result.error };
      }
    }
  }

  // Aucune règle ne match
  await supabase
    .from('leads')
    .update({
      status: 'error',
      error_message: 'No routing rule matched',
    })
    .eq('id', leadId);

  return { success: false, error: 'No routing rule matched' };
}

