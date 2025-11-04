'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import type { Funnel, RoutingRule, ConditionOperator } from '@/types';

interface RoutingPageProps {
  params: Promise<{ id: string }>;
}

export default function RoutingPage({ params }: RoutingPageProps) {
  const resolvedParams = use(params);
  const [funnel, setFunnel] = useState<Funnel | null>(null);
  const [rules, setRules] = useState<RoutingRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    loadData();
  }, [resolvedParams.id]);

  const loadData = async () => {
    // Load funnel
    const { data: funnelData, error: funnelError } = await supabase
      .from('funnels')
      .select('*')
      .eq('id', resolvedParams.id)
      .single();

    if (funnelError || !funnelData) {
      toast.error('Funnel introuvable');
      router.push('/funnels');
      return;
    }

    setFunnel(funnelData as Funnel);

    // Load routing rules
    const { data: rulesData, error: rulesError } = await supabase
      .from('routing_rules')
      .select('*')
      .eq('funnel_id', resolvedParams.id)
      .order('priority', { ascending: true });

    if (!rulesError && rulesData) {
      setRules(rulesData as RoutingRule[]);
    }

    setLoading(false);
  };

  const addRule = () => {
    const newRule: Partial<RoutingRule> = {
      funnel_id: resolvedParams.id,
      priority: rules.length,
      condition: {
        field: '',
        operator: '==',
        value: '',
      },
      webhook_url: '',
      client_name: '',
      is_active: true,
    };

    setRules([...rules, newRule as RoutingRule]);
  };

  const updateRule = (index: number, updates: Partial<RoutingRule>) => {
    const newRules = [...rules];
    newRules[index] = { ...newRules[index], ...updates };
    setRules(newRules);
  };

  const deleteRule = async (index: number) => {
    const rule = rules[index];
    
    if (rule.id) {
      const { error } = await supabase
        .from('routing_rules')
        .delete()
        .eq('id', rule.id);

      if (error) {
        toast.error('Erreur lors de la suppression');
        return;
      }
    }

    const newRules = rules.filter((_, i) => i !== index);
    setRules(newRules);
  };

  const moveRule = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === rules.length - 1) return;

    const newRules = [...rules];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    [newRules[index], newRules[newIndex]] = [newRules[newIndex], newRules[index]];
    
    // Update priorities
    newRules.forEach((rule, i) => {
      rule.priority = i;
    });

    setRules(newRules);
  };

  const saveRules = async () => {
    setSaving(true);

    try {
      // Delete all existing rules
      await supabase
        .from('routing_rules')
        .delete()
        .eq('funnel_id', resolvedParams.id);

      // Insert new rules
      const rulesToInsert = rules.map((rule, index) => ({
        funnel_id: resolvedParams.id,
        priority: index,
        condition: rule.condition,
        webhook_url: rule.webhook_url,
        client_name: rule.client_name,
        is_active: rule.is_active,
      }));

      const { error } = await supabase
        .from('routing_rules')
        .insert(rulesToInsert);

      if (error) {
        toast.error('Erreur lors de la sauvegarde');
        return;
      }

      toast.success('Règles sauvegardées !');
      loadData();
    } finally {
      setSaving(false);
    }
  };

  // Get available fields from funnel config
  const availableFields: string[] = [];
  if (funnel?.config?.variants?.[0]?.steps) {
    funnel.config.variants[0].steps.forEach((step) => {
      step.fields.forEach((field) => {
        if (!availableFields.includes(field.name)) {
          availableFields.push(field.name);
        }
      });
    });
  }

  if (loading) {
    return (
      <div className="container max-w-4xl py-8">
        <div className="mb-8 space-y-2">
          <div className="h-10 w-64 bg-gray-200 rounded animate-pulse" />
          <div className="h-4 w-48 bg-gray-200 rounded animate-pulse" />
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-64 w-full bg-gray-200 rounded animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!funnel) {
    return null;
  }

  return (
    <div className="container max-w-4xl py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Configuration du routage</h1>
          <p className="text-muted-foreground">{funnel.name}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.push(`/funnels/${funnel.id}`)}>
            Retour
          </Button>
          <Button onClick={saveRules} disabled={saving}>
            {saving ? 'Sauvegarde...' : 'Sauvegarder'}
          </Button>
        </div>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Règles de routage</CardTitle>
          <CardDescription>
            Les leads seront envoyés au premier webhook dont la condition est remplie.
            Ordonnez vos règles de la plus spécifique à la plus générale.
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="space-y-4">
        {rules.map((rule, index) => (
          <Card key={index}>
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="flex flex-col gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => moveRule(index, 'up')}
                    disabled={index === 0}
                  >
                    ↑
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => moveRule(index, 'down')}
                    disabled={index === rules.length - 1}
                  >
                    ↓
                  </Button>
                </div>

                <div className="flex-1 space-y-4">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">Règle {index + 1}</span>
                    <span className="text-sm text-muted-foreground">
                      (Priorité : {rule.priority})
                    </span>
                  </div>

                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="space-y-2">
                      <Label>Champ</Label>
                      <Select
                        value={rule.condition.field}
                        onValueChange={(value) =>
                          updateRule(index, {
                            condition: { ...rule.condition, field: value },
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner..." />
                        </SelectTrigger>
                        <SelectContent>
                          {availableFields.map((field) => (
                            <SelectItem key={field} value={field}>
                              {field}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Opérateur</Label>
                      <Select
                        value={rule.condition.operator}
                        onValueChange={(value) =>
                          updateRule(index, {
                            condition: {
                              ...rule.condition,
                              operator: value as ConditionOperator,
                            },
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="==">égal à (==)</SelectItem>
                          <SelectItem value="!=">différent de (!=)</SelectItem>
                          <SelectItem value=">">supérieur à (&gt;)</SelectItem>
                          <SelectItem value=">=">supérieur ou égal (≥)</SelectItem>
                          <SelectItem value="<">inférieur à (&lt;)</SelectItem>
                          <SelectItem value="<=">inférieur ou égal (≤)</SelectItem>
                          <SelectItem value="contains">contient</SelectItem>
                          <SelectItem value="startsWith">commence par</SelectItem>
                          <SelectItem value="endsWith">se termine par</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Valeur</Label>
                      <Input
                        value={rule.condition.value}
                        onChange={(e) =>
                          updateRule(index, {
                            condition: { ...rule.condition, value: e.target.value },
                          })
                        }
                        placeholder="Valeur..."
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Client</Label>
                    <Input
                      value={rule.client_name}
                      onChange={(e) => updateRule(index, { client_name: e.target.value })}
                      placeholder="Ex: FMDB, La Relève..."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Webhook URL</Label>
                    <Input
                      value={rule.webhook_url}
                      onChange={(e) => updateRule(index, { webhook_url: e.target.value })}
                      placeholder="https://..."
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      checked={rule.is_active}
                      onCheckedChange={(checked) =>
                        updateRule(index, { is_active: checked as boolean })
                      }
                    />
                    <Label>Règle active</Label>
                  </div>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => deleteRule(index)}
                >
                  🗑️
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}

        <Button onClick={addRule} className="w-full" variant="outline">
          + Ajouter une règle
        </Button>
      </div>

      {availableFields.length === 0 && (
        <Card className="mt-6">
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">
              Ajoutez des champs à votre formulaire pour créer des règles de routage.
            </p>
            <Button asChild className="mt-4">
              <a href={`/funnels/${funnel.id}/builder`}>
                Éditer le formulaire
              </a>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

