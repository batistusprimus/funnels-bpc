import { use } from 'react';
import { createClient } from '@/lib/supabase/server';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import type { Funnel, VariantKey } from '@/types';

interface ThankYouPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ v?: string }>;
}

export const dynamic = 'force-dynamic';

async function getFunnel(slug: string): Promise<Funnel | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('funnels')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error || !data) {
    return null;
  }

  return data as Funnel;
}

export default async function ThankYouPage({ params, searchParams }: ThankYouPageProps) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const funnel = await getFunnel(resolvedParams.slug);

  if (!funnel) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Funnel introuvable</p>
      </div>
    );
  }

  const variantKey = (resolvedSearchParams.v as VariantKey) || 'a';
  const variantConfig = funnel.config.variants.find((v) => v.key === variantKey);

  if (!variantConfig) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Variante introuvable</p>
      </div>
    );
  }

  const { thankYou } = variantConfig;
  const primaryColor = variantConfig.landing.theme?.primaryColor || '#2563eb';

  return (
    <div className="min-h-screen bg-gray-50 py-16">
      {/* Meta Pixel Event */}
      {funnel.config.tracking?.metaPixelId && (
        <script
          dangerouslySetInnerHTML={{
            __html: `
              fbq('track', 'Lead');
            `,
          }}
        />
      )}

      <div className="container mx-auto max-w-2xl px-4">
        <Card>
          <CardContent className="p-12 text-center">
            <div className="mb-6">
              <div
                className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full"
                style={{ backgroundColor: primaryColor }}
              >
                <svg
                  className="h-8 w-8 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h1 className="mb-4 text-3xl font-bold" style={{ color: primaryColor }}>
                {thankYou.title}
              </h1>
              <p className="text-lg text-muted-foreground">{thankYou.message}</p>
            </div>

            {thankYou.cta && (
              <Button
                asChild
                size="lg"
                className="mt-4"
                style={{ backgroundColor: primaryColor }}
              >
                <a href={thankYou.cta.href} target="_blank" rel="noopener noreferrer">
                  {thankYou.cta.text}
                </a>
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

