'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useDebounce } from '@/lib/hooks/use-debounce';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import type { Funnel, VariantConfig, StepConfig, FieldConfig } from '@/types';

interface BuilderPageProps {
  params: Promise<{ id: string }>;
}

export default function BuilderPage({ params }: BuilderPageProps) {
  const resolvedParams = use(params);
  const [funnel, setFunnel] = useState<Funnel | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedVariantIndex, setSelectedVariantIndex] = useState(0);
  const [editingField, setEditingField] = useState<{ stepId: string; fieldIndex: number } | null>(null);
  const [previewMode, setPreviewMode] = useState<'landing' | 'form'>('landing');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  
  const router = useRouter();
  const supabase = createClient();

  // Auto-save avec debounce de 3 secondes
  const debouncedFunnel = useDebounce(funnel, 3000);

  useEffect(() => {
    loadFunnel();
  }, [resolvedParams.id]);

  useEffect(() => {
    if (debouncedFunnel && hasUnsavedChanges) {
      saveFunnel(true); // Auto-save silencieux
    }
  }, [debouncedFunnel]);

  const loadFunnel = async () => {
    const { data, error } = await supabase
      .from('funnels')
      .select('*')
      .eq('id', resolvedParams.id)
      .single();

    if (error || !data) {
      toast.error('Funnel introuvable');
      router.push('/funnels');
      return;
    }

    setFunnel(data as Funnel);
    setLoading(false);
  };

  const saveFunnel = async (silent = false) => {
    if (!funnel) return;

    setSaving(true);
    const { error } = await supabase
      .from('funnels')
      .update({ config: funnel.config })
      .eq('id', funnel.id);

    if (error) {
      if (!silent) toast.error('Erreur lors de la sauvegarde');
    } else {
      if (!silent) toast.success('Funnel sauvegardé !');
      setHasUnsavedChanges(false);
    }
    setSaving(false);
  };

  const updateVariant = (updates: Partial<VariantConfig>) => {
    if (!funnel) return;
    
    const newConfig = { ...funnel.config };
    newConfig.variants[selectedVariantIndex] = {
      ...newConfig.variants[selectedVariantIndex],
      ...updates,
    };
    
    setFunnel({ ...funnel, config: newConfig });
    setHasUnsavedChanges(true);
  };

  const updateLanding = (updates: Partial<VariantConfig['landing']>) => {
    if (!funnel) return;
    
    const variant = funnel.config.variants[selectedVariantIndex];
    updateVariant({
      landing: { ...variant.landing, ...updates },
    });
  };

  const updateThankYou = (updates: Partial<VariantConfig['thankYou']>) => {
    if (!funnel) return;
    
    const variant = funnel.config.variants[selectedVariantIndex];
    updateVariant({
      thankYou: { ...variant.thankYou, ...updates },
    });
  };

  const addStep = () => {
    if (!funnel) return;
    
    const variant = funnel.config.variants[selectedVariantIndex];
    const newStep: StepConfig = {
      id: `step${variant.steps.length + 1}`,
      title: `Étape ${variant.steps.length + 1}`,
      fields: [],
      nextStep: null,
    };
    
    updateVariant({
      steps: [...variant.steps, newStep],
    });
  };

  const updateStep = (stepId: string, updates: Partial<StepConfig>) => {
    if (!funnel) return;
    
    const variant = funnel.config.variants[selectedVariantIndex];
    const steps = variant.steps.map((step) =>
      step.id === stepId ? { ...step, ...updates } : step
    );
    
    updateVariant({ steps });
  };

  const deleteStep = (stepId: string) => {
    if (!funnel) return;
    
    const variant = funnel.config.variants[selectedVariantIndex];
    const steps = variant.steps.filter((step) => step.id !== stepId);
    
    updateVariant({ steps });
  };

  const addField = (stepId: string) => {
    if (!funnel) return;
    
    const variant = funnel.config.variants[selectedVariantIndex];
    const steps = variant.steps.map((step) => {
      if (step.id === stepId) {
        const newField: FieldConfig = {
          type: 'text',
          name: `field${step.fields.length + 1}`,
          label: `Champ ${step.fields.length + 1}`,
          required: false,
        };
        return { ...step, fields: [...step.fields, newField] };
      }
      return step;
    });
    
    updateVariant({ steps });
  };

  const updateField = (stepId: string, fieldIndex: number, field: FieldConfig) => {
    if (!funnel) return;
    
    const variant = funnel.config.variants[selectedVariantIndex];
    const steps = variant.steps.map((step) => {
      if (step.id === stepId) {
        const fields = [...step.fields];
        fields[fieldIndex] = field;
        return { ...step, fields };
      }
      return step;
    });
    
    updateVariant({ steps });
  };

  const deleteField = (stepId: string, fieldIndex: number) => {
    if (!funnel) return;
    
    const variant = funnel.config.variants[selectedVariantIndex];
    const steps = variant.steps.map((step) => {
      if (step.id === stepId) {
        const fields = step.fields.filter((_, i) => i !== fieldIndex);
        return { ...step, fields };
      }
      return step;
    });
    
    updateVariant({ steps });
  };

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-3.5rem)]">
        <div className="w-1/2 p-6 space-y-4">
          <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
          <div className="h-10 w-full bg-gray-200 rounded animate-pulse" />
          <div className="h-64 w-full bg-gray-200 rounded animate-pulse" />
        </div>
        <div className="w-1/2 bg-gray-50 p-6">
          <div className="h-96 w-full bg-gray-200 rounded animate-pulse" />
        </div>
      </div>
    );
  }

  if (!funnel) {
    return null;
  }

  const variant = funnel.config.variants[selectedVariantIndex];

  return (
    <div className="flex h-[calc(100vh-3.5rem)]">
      {/* Left Panel - Editor */}
      <div className="w-1/2 overflow-y-auto border-r p-6">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold">{funnel.name}</h1>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => router.push(`/funnels/${funnel.id}`)}>
              Retour
            </Button>
            <Button onClick={saveFunnel} disabled={saving}>
              {saving ? 'Sauvegarde...' : 'Sauvegarder'}
            </Button>
          </div>
        </div>

        <Tabs defaultValue="landing">
          <TabsList className="mb-4">
            <TabsTrigger value="landing" onClick={() => setPreviewMode('landing')}>
              Landing
            </TabsTrigger>
            <TabsTrigger value="form" onClick={() => setPreviewMode('form')}>
              Formulaire
            </TabsTrigger>
            <TabsTrigger value="thankyou">
              Thank You
            </TabsTrigger>
          </TabsList>

          <TabsContent value="landing" className="space-y-4">
            <Card className="p-4">
              <h3 className="mb-4 font-semibold">Page d'atterrissage</h3>
              
              <div className="space-y-4">
                <div>
                  <Label>Titre</Label>
                  <Input
                    value={variant.landing.title}
                    onChange={(e) => updateLanding({ title: e.target.value })}
                  />
                </div>

                <div>
                  <Label>Sous-titre</Label>
                  <Textarea
                    value={variant.landing.subtitle}
                    onChange={(e) => updateLanding({ subtitle: e.target.value })}
                    rows={3}
                  />
                </div>

                <div>
                  <Label>Texte du CTA</Label>
                  <Input
                    value={variant.landing.cta.text}
                    onChange={(e) =>
                      updateLanding({
                        cta: { ...variant.landing.cta, text: e.target.value },
                      })
                    }
                  />
                </div>

                <div>
                  <Label>Couleur principale</Label>
                  <Input
                    type="color"
                    value={variant.landing.theme?.primaryColor || '#2563eb'}
                    onChange={(e) =>
                      updateLanding({
                        theme: {
                          ...variant.landing.theme,
                          primaryColor: e.target.value,
                        },
                      })
                    }
                  />
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="form" className="space-y-4">
            {variant.steps.map((step, stepIndex) => (
              <Card key={step.id} className="p-4">
                <div className="mb-4 flex items-start justify-between">
                  <div className="flex-1 space-y-2">
                    <Input
                      value={step.title}
                      onChange={(e) => updateStep(step.id, { title: e.target.value })}
                      className="font-semibold"
                    />
                    <Input
                      value={step.subtitle || ''}
                      onChange={(e) => updateStep(step.id, { subtitle: e.target.value })}
                      placeholder="Sous-titre (optionnel)"
                    />
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteStep(step.id)}
                  >
                    🗑️
                  </Button>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Champs</Label>
                  {step.fields.map((field, fieldIndex) => (
                    <div
                      key={fieldIndex}
                      className="flex items-center gap-2 rounded border p-2"
                    >
                      <span className="flex-1 text-sm">
                        {field.label} ({field.type})
                        {field.required && <Badge variant="secondary" className="ml-2">Requis</Badge>}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingField({ stepId: step.id, fieldIndex })}
                      >
                        ✏️
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteField(step.id, fieldIndex)}
                      >
                        🗑️
                      </Button>
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => addField(step.id)}
                    className="w-full"
                  >
                    + Ajouter un champ
                  </Button>
                </div>

                <div className="mt-4">
                  <Label>Étape suivante</Label>
                  <Select
                    value={step.nextStep || 'null'}
                    onValueChange={(value) =>
                      updateStep(step.id, { nextStep: value === 'null' ? null : value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="null">Fin du formulaire</SelectItem>
                      {variant.steps
                        .filter((s) => s.id !== step.id)
                        .map((s) => (
                          <SelectItem key={s.id} value={s.id}>
                            {s.title}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              </Card>
            ))}

            <Button onClick={addStep} className="w-full">
              + Ajouter une étape
            </Button>
          </TabsContent>

          <TabsContent value="thankyou" className="space-y-4">
            <Card className="p-4">
              <h3 className="mb-4 font-semibold">Page de remerciement</h3>
              
              <div className="space-y-4">
                <div>
                  <Label>Titre</Label>
                  <Input
                    value={variant.thankYou.title}
                    onChange={(e) => updateThankYou({ title: e.target.value })}
                  />
                </div>

                <div>
                  <Label>Message</Label>
                  <Textarea
                    value={variant.thankYou.message}
                    onChange={(e) => updateThankYou({ message: e.target.value })}
                    rows={3}
                  />
                </div>

                <div>
                  <Label>CTA (optionnel)</Label>
                  <Input
                    value={variant.thankYou.cta?.text || ''}
                    onChange={(e) =>
                      updateThankYou({
                        cta: e.target.value
                          ? { text: e.target.value, href: variant.thankYou.cta?.href || '' }
                          : null,
                      })
                    }
                    placeholder="Texte du bouton"
                  />
                  {variant.thankYou.cta && (
                    <Input
                      value={variant.thankYou.cta.href}
                      onChange={(e) =>
                        updateThankYou({
                          cta: { ...variant.thankYou.cta!, href: e.target.value },
                        })
                      }
                      placeholder="https://..."
                      className="mt-2"
                    />
                  )}
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Right Panel - Preview */}
      <div className="w-1/2 overflow-y-auto bg-gray-50 p-6">
        <div className="mx-auto max-w-2xl">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold">Prévisualisation</h2>
            <Badge>Variante {variant.key.toUpperCase()}</Badge>
          </div>
          
          {previewMode === 'landing' ? (
            <PreviewLanding variant={variant} />
          ) : (
            <PreviewForm variant={variant} />
          )}
        </div>
      </div>

      {/* Field Editor Dialog */}
      {editingField && (
        <FieldEditorDialog
          field={variant.steps.find((s) => s.id === editingField.stepId)?.fields[editingField.fieldIndex]!}
          onSave={(field) => {
            updateField(editingField.stepId, editingField.fieldIndex, field);
            setEditingField(null);
          }}
          onClose={() => setEditingField(null)}
        />
      )}
    </div>
  );
}

function PreviewLanding({ variant }: { variant: VariantConfig }) {
  const primaryColor = variant.landing.theme?.primaryColor || '#2563eb';
  
  return (
    <Card className="p-8" style={{ backgroundColor: variant.landing.theme?.backgroundColor || '#ffffff' }}>
      <div className="space-y-6 text-center">
        <h1 className="text-4xl font-bold" style={{ color: primaryColor }}>
          {variant.landing.title}
        </h1>
        <p className="text-xl text-gray-600">{variant.landing.subtitle}</p>
        <Button size="lg" style={{ backgroundColor: primaryColor }}>
          {variant.landing.cta.text}
        </Button>
      </div>
    </Card>
  );
}

function PreviewForm({ variant }: { variant: VariantConfig }) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const currentStep = variant.steps[currentStepIndex];
  
  if (!currentStep) {
    return (
      <Card className="p-8">
        <p className="text-center text-muted-foreground">Ajoutez des étapes à votre formulaire</p>
      </Card>
    );
  }

  return (
    <Card className="p-8">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold">{currentStep.title}</h2>
          {currentStep.subtitle && (
            <p className="text-muted-foreground">{currentStep.subtitle}</p>
          )}
        </div>

        <div className="space-y-4">
          {currentStep.fields.map((field, index) => (
            <div key={index} className="space-y-2">
              <Label>
                {field.label}
                {field.required && <span className="text-red-500"> *</span>}
              </Label>
              {field.type === 'textarea' ? (
                <Textarea placeholder={field.placeholder} />
              ) : field.type === 'select' ? (
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez..." />
                  </SelectTrigger>
                  <SelectContent>
                    {field.options?.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : field.type === 'radio' ? (
                <div className="space-y-2">
                  {field.options?.map((option) => (
                    <div key={option} className="flex items-center space-x-2">
                      <input type="radio" name={field.name} />
                      <Label>{option}</Label>
                    </div>
                  ))}
                </div>
              ) : (
                <Input type={field.type} placeholder={field.placeholder} />
              )}
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          {currentStepIndex > 0 && (
            <Button
              variant="outline"
              onClick={() => setCurrentStepIndex(currentStepIndex - 1)}
            >
              Précédent
            </Button>
          )}
          <Button
            className="ml-auto"
            onClick={() => {
              if (currentStep.nextStep) {
                const nextIndex = variant.steps.findIndex((s) => s.id === currentStep.nextStep);
                if (nextIndex !== -1) {
                  setCurrentStepIndex(nextIndex);
                }
              }
            }}
          >
            {currentStep.nextStep ? 'Suivant' : 'Envoyer'}
          </Button>
        </div>
      </div>
    </Card>
  );
}

function FieldEditorDialog({
  field,
  onSave,
  onClose,
}: {
  field: FieldConfig;
  onSave: (field: FieldConfig) => void;
  onClose: () => void;
}) {
  const [editedField, setEditedField] = useState<FieldConfig>(field);

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Éditer le champ</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label>Type de champ</Label>
            <Select
              value={editedField.type}
              onValueChange={(value) =>
                setEditedField({ ...editedField, type: value as FieldConfig['type'] })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="text">Texte</SelectItem>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="tel">Téléphone</SelectItem>
                <SelectItem value="number">Nombre</SelectItem>
                <SelectItem value="textarea">Zone de texte</SelectItem>
                <SelectItem value="select">Liste déroulante</SelectItem>
                <SelectItem value="radio">Boutons radio</SelectItem>
                <SelectItem value="checkbox">Case à cocher</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Nom du champ</Label>
            <Input
              value={editedField.name}
              onChange={(e) => setEditedField({ ...editedField, name: e.target.value })}
            />
          </div>

          <div>
            <Label>Label</Label>
            <Input
              value={editedField.label}
              onChange={(e) => setEditedField({ ...editedField, label: e.target.value })}
            />
          </div>

          <div>
            <Label>Placeholder</Label>
            <Input
              value={editedField.placeholder || ''}
              onChange={(e) => setEditedField({ ...editedField, placeholder: e.target.value })}
            />
          </div>

          {(editedField.type === 'select' || editedField.type === 'radio') && (
            <div>
              <Label>Options (une par ligne)</Label>
              <Textarea
                value={editedField.options?.join('\n') || ''}
                onChange={(e) =>
                  setEditedField({
                    ...editedField,
                    options: e.target.value.split('\n').filter((o) => o.trim()),
                  })
                }
                rows={5}
              />
            </div>
          )}

          {editedField.type === 'number' && (
            <>
              <div>
                <Label>Minimum</Label>
                <Input
                  type="number"
                  value={editedField.min || ''}
                  onChange={(e) =>
                    setEditedField({ ...editedField, min: Number(e.target.value) })
                  }
                />
              </div>
              <div>
                <Label>Maximum</Label>
                <Input
                  type="number"
                  value={editedField.max || ''}
                  onChange={(e) =>
                    setEditedField({ ...editedField, max: Number(e.target.value) })
                  }
                />
              </div>
            </>
          )}

          <div className="flex items-center space-x-2">
            <Checkbox
              checked={editedField.required}
              onCheckedChange={(checked) =>
                setEditedField({ ...editedField, required: checked as boolean })
              }
            />
            <Label>Champ obligatoire</Label>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Annuler
          </Button>
          <Button onClick={() => onSave(editedField)}>Sauvegarder</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

