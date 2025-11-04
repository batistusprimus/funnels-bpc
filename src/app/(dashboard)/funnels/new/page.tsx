'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from 'sonner';
import { generateSlug } from '@/lib/utils';
import { getTemplate } from '@/lib/templates';

type Template = 'simple' | 'storytelling' | 'quiz' | 'blank';

export default function NewFunnelPage() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  // Step 1: Informations générales
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [domain, setDomain] = useState('');
  const [description, setDescription] = useState('');

  // Step 2: Template
  const [template, setTemplate] = useState<Template>('simple');

  // Step 3: Tracking
  const [metaPixelId, setMetaPixelId] = useState('');
  const [ga4Id, setGa4Id] = useState('');
  const [gtmId, setGtmId] = useState('');

  const handleNameChange = (value: string) => {
    setName(value);
    if (!slug || slug === generateSlug(name)) {
      setSlug(generateSlug(value));
    }
  };

  const handleSubmit = async () => {
    if (!name || !slug) {
      toast.error('Veuillez remplir tous les champs requis');
      return;
    }

    setLoading(true);

    try {
      // Vérifier si le slug existe déjà
      const { data: existing } = await supabase
        .from('funnels')
        .select('id')
        .eq('slug', slug)
        .single();

      if (existing) {
        toast.error('Ce slug existe déjà', {
          description: 'Veuillez choisir un slug différent',
        });
        setLoading(false);
        return;
      }

      // Récupérer la config du template
      const config = getTemplate(template);

      // Ajouter le tracking à la config
      if (metaPixelId || ga4Id || gtmId) {
        config.tracking = {
          metaPixelId: metaPixelId || undefined,
          ga4Id: ga4Id || undefined,
          gtmId: gtmId || undefined,
        };
      }

      // Créer le funnel
      const { data, error } = await supabase
        .from('funnels')
        .insert({
          name,
          slug,
          domain: domain || null,
          description: description || null,
          status: 'draft',
          config,
        })
        .select()
        .single();

      if (error) {
        toast.error('Erreur lors de la création', {
          description: error.message,
        });
        return;
      }

      toast.success('Funnel créé avec succès !');
      router.push(`/funnels/${data.id}/builder`);
    } catch (error) {
      toast.error('Erreur lors de la création', {
        description: 'Une erreur inattendue s\'est produite',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container max-w-2xl py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Créer un nouveau funnel</h1>
        <p className="text-muted-foreground">
          Étape {step} sur 3
        </p>
      </div>

      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Informations générales</CardTitle>
            <CardDescription>
              Définissez les informations de base de votre funnel
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nom du funnel *</Label>
              <Input
                id="name"
                placeholder="Ex: FlipImmo - Guide Investissement"
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug">Slug (URL) *</Label>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">/f/</span>
                <Input
                  id="slug"
                  placeholder="flipimmo-guide"
                  value={slug}
                  onChange={(e) => setSlug(generateSlug(e.target.value))}
                  required
                />
              </div>
              <p className="text-xs text-muted-foreground">
                URL publique : {process.env.NEXT_PUBLIC_APP_URL}/f/{slug || 'votre-slug'}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="domain">Domaine personnalisé (optionnel)</Label>
              <Input
                id="domain"
                placeholder="Ex: guide.flipimmo.fr"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (optionnel)</Label>
              <Textarea
                id="description"
                placeholder="Décrivez brièvement ce funnel..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button onClick={() => setStep(2)}>
                Suivant
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle>Choisir un template</CardTitle>
            <CardDescription>
              Démarrez avec un modèle prédéfini ou partez de zéro
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <RadioGroup value={template} onValueChange={(v) => setTemplate(v as Template)}>
              <div className="flex items-start space-x-3 space-y-0 rounded-md border p-4">
                <RadioGroupItem value="simple" id="simple" />
                <div className="flex-1">
                  <Label htmlFor="simple" className="font-medium">
                    Landing Simple
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Une page courte avec un formulaire d'optin basique (prénom, email, téléphone)
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3 space-y-0 rounded-md border p-4">
                <RadioGroupItem value="storytelling" id="storytelling" />
                <div className="flex-1">
                  <Label htmlFor="storytelling" className="font-medium">
                    Landing Storytelling
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Longue page narrative avec formulaire détaillé pour qualifier les leads
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3 space-y-0 rounded-md border p-4">
                <RadioGroupItem value="quiz" id="quiz" />
                <div className="flex-1">
                  <Label htmlFor="quiz" className="font-medium">
                    Quiz Multi-Étapes
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Questions progressives pour engager et qualifier les visiteurs
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3 space-y-0 rounded-md border p-4">
                <RadioGroupItem value="blank" id="blank" />
                <div className="flex-1">
                  <Label htmlFor="blank" className="font-medium">
                    Vierge
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Partir de zéro et créer votre funnel depuis une page blanche
                  </p>
                </div>
              </div>
            </RadioGroup>

            <div className="flex justify-between gap-2 pt-4">
              <Button variant="outline" onClick={() => setStep(1)}>
                Précédent
              </Button>
              <Button onClick={() => setStep(3)}>
                Suivant
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 3 && (
        <Card>
          <CardHeader>
            <CardTitle>Tracking & Intégrations</CardTitle>
            <CardDescription>
              Configurez vos outils d'analyse (optionnel)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="metaPixel">Meta Pixel ID</Label>
              <Input
                id="metaPixel"
                placeholder="123456789"
                value={metaPixelId}
                onChange={(e) => setMetaPixelId(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ga4">Google Analytics 4 ID</Label>
              <Input
                id="ga4"
                placeholder="G-XXXXXXXXXX"
                value={ga4Id}
                onChange={(e) => setGa4Id(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="gtm">Google Tag Manager ID</Label>
              <Input
                id="gtm"
                placeholder="GTM-XXXXXXX"
                value={gtmId}
                onChange={(e) => setGtmId(e.target.value)}
              />
            </div>

            <div className="flex justify-between gap-2 pt-4">
              <Button variant="outline" onClick={() => setStep(2)}>
                Précédent
              </Button>
              <Button onClick={handleSubmit} disabled={loading}>
                {loading ? 'Création...' : 'Créer le funnel'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

