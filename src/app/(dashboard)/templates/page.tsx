'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Download, Upload, Search, Tag } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  tags: string[];
  preview_image?: string;
  config: any;
  download_count: number;
  created_at: string;
}

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [filteredTemplates, setFilteredTemplates] = useState<Template[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    loadTemplates();
  }, []);

  useEffect(() => {
    filterTemplates();
  }, [searchQuery, selectedCategory, templates]);

  const loadTemplates = async () => {
    const { data, error } = await supabase
      .from('templates')
      .select('*')
      .eq('is_public', true)
      .order('download_count', { ascending: false });

    if (error) {
      toast.error('Erreur lors du chargement des templates');
      console.error(error);
    } else {
      setTemplates(data as Template[]);
    }
    setLoading(false);
  };

  const filterTemplates = () => {
    let filtered = templates;

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(t => t.category === selectedCategory);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(t =>
        t.name.toLowerCase().includes(query) ||
        t.description?.toLowerCase().includes(query) ||
        t.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    setFilteredTemplates(filtered);
  };

  const categories = ['all', ...Array.from(new Set(templates.map(t => t.category)))];

  const handleExportTemplate = (template: Template) => {
    const dataStr = JSON.stringify(template, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    const exportFileDefaultName = `template-${template.name.toLowerCase().replace(/\s+/g, '-')}.json`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();

    toast.success('Template exporté avec succès');
  };

  const handleImportTemplate = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      try {
        const text = await file.text();
        const templateData = JSON.parse(text);

        // Valider la structure
        if (!templateData.name || !templateData.config) {
          throw new Error('Format de template invalide');
        }

        // Créer un nouveau funnel à partir du template
        const { data, error } = await supabase
          .from('funnels')
          .insert({
            name: templateData.name + ' (Copie)',
            slug: `${templateData.name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`,
            description: templateData.description,
            config: templateData.config,
            tags: templateData.tags || [],
            status: 'draft'
          })
          .select()
          .single();

        if (error) throw error;

        toast.success('Template importé avec succès');
        router.push(`/funnels/${data.id}/builder`);
      } catch (error) {
        console.error(error);
        toast.error('Erreur lors de l\'import du template');
      }
    };
    input.click();
  };

  const handleUseTemplate = async (template: Template) => {
    try {
      // Incrémenter le compteur de téléchargements
      await supabase
        .from('templates')
        .update({ download_count: template.download_count + 1 })
        .eq('id', template.id);

      // Créer un nouveau funnel
      const { data, error } = await supabase
        .from('funnels')
        .insert({
          name: template.name + ' (Copie)',
          slug: `${template.name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`,
          description: template.description,
          config: template.config,
          tags: template.tags || [],
          status: 'draft'
        })
        .select()
        .single();

      if (error) throw error;

      toast.success('Template appliqué avec succès');
      router.push(`/funnels/${data.id}/builder`);
    } catch (error) {
      console.error(error);
      toast.error('Erreur lors de l\'application du template');
    }
  };

  if (loading) {
    return (
      <div className="container py-8">
        <div className="flex items-center justify-center h-96">
          <p className="text-muted-foreground">Chargement des templates...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Templates</h1>
          <p className="text-muted-foreground">
            Explorez et utilisez des templates pré-configurés
          </p>
        </div>
        <Button onClick={handleImportTemplate} variant="outline">
          <Upload className="mr-2 h-4 w-4" />
          Importer JSON
        </Button>
      </div>

      <div className="flex gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher un template..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-2">
          {categories.map((cat) => (
            <Button
              key={cat}
              variant={selectedCategory === cat ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(cat)}
            >
              {cat === 'all' ? 'Tous' : cat}
            </Button>
          ))}
        </div>
      </div>

      {filteredTemplates.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <p className="text-lg text-muted-foreground mb-4">
              Aucun template trouvé
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredTemplates.map((template) => (
            <Card key={template.id} className="flex flex-col">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle>{template.name}</CardTitle>
                  <Badge variant="secondary">{template.category}</Badge>
                </div>
                <CardDescription className="line-clamp-2">
                  {template.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1">
                <div className="flex flex-wrap gap-2">
                  {template.tags?.map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      <Tag className="mr-1 h-3 w-3" />
                      {tag}
                    </Badge>
                  ))}
                </div>
                <div className="mt-4 text-sm text-muted-foreground">
                  <Download className="inline h-4 w-4 mr-1" />
                  {template.download_count} téléchargements
                </div>
              </CardContent>
              <CardFooter className="gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => handleExportTemplate(template)}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Export
                </Button>
                <Button
                  className="flex-1"
                  onClick={() => handleUseTemplate(template)}
                >
                  Utiliser
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

