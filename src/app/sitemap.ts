import { MetadataRoute } from 'next';
import { createClient } from '@/lib/supabase/server';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  // Pages statiques
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/login`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/setup`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.3,
    },
  ];

  try {
    // Pages dynamiques : funnels publics actifs
    const supabase = await createClient();
    const { data: funnels } = await supabase
      .from('funnels')
      .select('slug, updated_at')
      .eq('status', 'active');

    const funnelPages: MetadataRoute.Sitemap = (funnels || []).map((funnel) => ({
      url: `${baseUrl}/f/${funnel.slug}`,
      lastModified: new Date(funnel.updated_at),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }));

    return [...staticPages, ...funnelPages];
  } catch (error) {
    console.error('Error generating sitemap:', error);
    return staticPages;
  }
}

