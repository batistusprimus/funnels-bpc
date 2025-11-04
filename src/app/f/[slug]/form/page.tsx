'use client';

import { use, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent } from '@/components/ui/card';
import { SelectableCard } from '@/components/ui/selectable-card';
import { toast } from 'sonner';
import { extractUTMParams } from '@/lib/utils';
import type { Funnel, StepConfig, FieldConfig, VariantKey} from '@/types';

interface FormPageProps {
  params: Promise<{ slug: string }>;
}

export default function FormPage({ params }: FormPageProps) {
  const resolvedParams = use(params);
  const searchParams = useSearchParams();
  const router = useRouter();
  const supabase = createClient();

  const [funnel, setFunnel] = useState<Funnel | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [variant, setVariant] = useState<VariantKey>('a');

  useEffect(() => {
    loadFunnel();
  }, [resolvedParams.slug]);

  const loadFunnel = async () => {
    const { data, error } = await supabase
      .from('funnels')
      .select('*')
      .eq('slug', resolvedParams.slug)
      .single();

    if (error || !data) {
      toast.error('Funnel introuvable');
      return;
    }

    const funnelData = data as Funnel;
    setFunnel(funnelData);

    // Récupérer la variante depuis les query params
    const v = searchParams.get('v') as VariantKey;
    if (v && ['a', 'b', 'c'].includes(v)) {
      setVariant(v);
    }

    setLoading(false);
  };

  const handleFieldChange = (fieldName: string, value: any) => {
    setFormData({ ...formData, [fieldName]: value });
  };

  const validateStep = (step: StepConfig): boolean => {
    for (const field of step.fields) {
      if (field.required && !formData[field.name]) {
        toast.error(`Le champ "${field.label}" est obligatoire`);
        return false;
      }

      // Validation spécifique par type
      if (formData[field.name]) {
        if (field.type === 'email') {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(formData[field.name])) {
            toast.error(`Le champ "${field.label}" doit être un email valide`);
            return false;
          }
        }

        if (field.type === 'number') {
          const num = Number(formData[field.name]);
          if (isNaN(num)) {
            toast.error(`Le champ "${field.label}" doit être un nombre`);
            return false;
          }
          if (field.min !== undefined && num < field.min) {
            toast.error(`Le champ "${field.label}" doit être supérieur à ${field.min}`);
            return false;
          }
          if (field.max !== undefined && num > field.max) {
            toast.error(`Le champ "${field.label}" doit être inférieur à ${field.max}`);
            return false;
          }
        }
      }
    }

    return true;
  };

  const handleNext = () => {
    if (!funnel) return;

    const variantConfig = funnel.config.variants.find((v) => v.key === variant);
    if (!variantConfig) return;

    const currentStep = variantConfig.steps[currentStepIndex];
    
    if (!validateStep(currentStep)) {
      return;
    }

    if (currentStep.nextStep) {
      const nextStepIndex = variantConfig.steps.findIndex(
        (s) => s.id === currentStep.nextStep
      );
      if (nextStepIndex !== -1) {
        setCurrentStepIndex(nextStepIndex);
      }
    } else {
      // Dernière étape, soumettre le formulaire
      handleSubmit();
    }
  };

  const handlePrevious = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  const handleSubmit = async () => {
    if (!funnel) return;

    setSubmitting(true);

    try {
      // Extraire les UTM params
      const utmParams = extractUTMParams(searchParams);

      // Soumettre le lead
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          funnelId: funnel.id,
          variant,
          data: formData,
          utmParams,
        }),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la soumission');
      }

      // Rediriger vers la page de remerciement
      const thankYouUrl = new URL(`/f/${funnel.slug}/thank-you`, window.location.origin);
      thankYouUrl.searchParams.set('v', variant);
      router.push(thankYouUrl.pathname + thankYouUrl.search);
    } catch (error) {
      toast.error('Erreur lors de la soumission', {
        description: 'Veuillez réessayer plus tard',
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-16">
        <div className="container mx-auto max-w-2xl px-4">
          <Card>
            <CardContent className="p-8 space-y-6">
              <div className="h-8 w-3/4 bg-gray-200 rounded animate-pulse" />
              <div className="h-4 w-1/2 bg-gray-200 rounded animate-pulse" />
              <div className="space-y-4">
                <div className="h-10 w-full bg-gray-200 rounded animate-pulse" />
                <div className="h-10 w-full bg-gray-200 rounded animate-pulse" />
              </div>
              <div className="h-12 w-32 bg-gray-200 rounded animate-pulse ml-auto" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!funnel) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Funnel introuvable</p>
      </div>
    );
  }

  const variantConfig = funnel.config.variants.find((v) => v.key === variant);
  if (!variantConfig) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Variante introuvable</p>
      </div>
    );
  }

  const currentStep = variantConfig.steps[currentStepIndex];
  const primaryColor = variantConfig.landing.theme?.primaryColor || '#2563eb';

  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="container mx-auto max-w-2xl px-4">
        <Card>
          <CardContent className="p-8">
            <div className="mb-6">
              <h1 className="mb-2 text-2xl font-bold" style={{ color: primaryColor }}>
                {currentStep.title}
              </h1>
              {currentStep.subtitle && (
                <p className="text-muted-foreground">{currentStep.subtitle}</p>
              )}
            </div>

            {/* Progress indicator */}
            <div className="mb-8">
              <div className="flex justify-between text-sm text-muted-foreground mb-2">
                <span>
                  Étape {currentStepIndex + 1} sur {variantConfig.steps.length}
                </span>
                <span>
                  {Math.round(((currentStepIndex + 1) / variantConfig.steps.length) * 100)}%
                </span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full transition-all"
                  style={{
                    backgroundColor: primaryColor,
                    width: `${((currentStepIndex + 1) / variantConfig.steps.length) * 100}%`,
                  }}
                />
              </div>
            </div>

            <div className="space-y-4">
              {currentStep.fields.map((field) => (
                <FormField
                  key={field.name}
                  field={field}
                  value={formData[field.name]}
                  onChange={(value) => handleFieldChange(field.name, value)}
                />
              ))}
            </div>

            <div className="mt-8 flex justify-between gap-4">
              {currentStepIndex > 0 && (
                <Button variant="outline" onClick={handlePrevious}>
                  Précédent
                </Button>
              )}
              <Button
                onClick={handleNext}
                disabled={submitting}
                className="ml-auto"
                style={{ backgroundColor: primaryColor }}
              >
                {submitting
                  ? 'Envoi...'
                  : currentStep.nextStep
                  ? 'Suivant'
                  : 'Envoyer'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function FormField({
  field,
  value,
  onChange,
}: {
  field: FieldConfig;
  value: any;
  onChange: (value: any) => void;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={field.name}>
        {field.label}
        {field.required && <span className="text-red-500"> *</span>}
      </Label>

      {field.type === 'textarea' ? (
        <Textarea
          id={field.name}
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
          required={field.required}
        />
      ) : field.type === 'select' ? (
        <Select value={value || ''} onValueChange={onChange}>
          <SelectTrigger id={field.name}>
            <SelectValue placeholder={field.placeholder || 'Sélectionnez...'} />
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
        <div className="space-y-3">
          {field.options?.map((option) => (
            <SelectableCard
              key={option}
              value={option}
              label={option}
              selected={value === option}
              onSelect={() => onChange(option)}
            />
          ))}
        </div>
      ) : field.type === 'checkbox' ? (
        <div className="flex items-center space-x-2">
          <Checkbox
            id={field.name}
            checked={value || false}
            onCheckedChange={onChange}
          />
          <Label htmlFor={field.name}>{field.placeholder}</Label>
        </div>
      ) : (
        <Input
          id={field.name}
          type={field.type}
          value={value || ''}
          onChange={(e) => {
            const val = field.type === 'number' ? Number(e.target.value) : e.target.value;
            onChange(val);
          }}
          placeholder={field.placeholder}
          required={field.required}
          min={field.min}
          max={field.max}
        />
      )}
    </div>
  );
}

