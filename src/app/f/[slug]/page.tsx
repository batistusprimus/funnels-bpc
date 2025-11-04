import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { Button } from '@/components/ui/button';
import { selectVariant } from '@/lib/variant-selector';
import type { Funnel } from '@/types';

interface LandingPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ v?: string; [key: string]: string | string[] | undefined }>;
}

export const dynamic = 'force-dynamic';
export const revalidate = 60; // ISR : revalider toutes les 60 secondes

async function getFunnel(slug: string): Promise<Funnel | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('funnels')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'active')
    .single();

  if (error || !data) {
    return null;
  }

  return data as Funnel;
}

export default async function LandingPage({ params, searchParams }: LandingPageProps) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const funnel = await getFunnel(resolvedParams.slug);

  if (!funnel) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Funnel introuvable</h1>
          <p className="text-muted-foreground">
            Ce funnel n'existe pas ou n'est pas actif.
          </p>
        </div>
      </div>
    );
  }

  // Sélectionner la variante
  const variant = selectVariant(
    funnel.config.variants,
    resolvedSearchParams.v as string | undefined
  );

  const { landing } = variant;
  const primaryColor = landing.theme?.primaryColor || '#2563eb';
  const backgroundColor = landing.theme?.backgroundColor || '#ffffff';

  // Construire l'URL du formulaire avec les UTM params
  const formUrl = new URL(`/f/${funnel.slug}/form`, process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000');
  formUrl.searchParams.set('v', variant.key);
  
  // Transférer tous les query params (UTM, etc.)
  Object.entries(resolvedSearchParams).forEach(([key, value]) => {
    if (value && typeof value === 'string') {
      formUrl.searchParams.set(key, value);
    }
  });

  return (
    <div style={{ backgroundColor }} className="min-h-screen">
      {/* Meta Pixel Tracking */}
      {funnel.config.tracking?.metaPixelId && (
        <script
          dangerouslySetInnerHTML={{
            __html: `
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', '${funnel.config.tracking.metaPixelId}');
              fbq('track', 'PageView');
            `,
          }}
        />
      )}

      {/* Google Analytics 4 */}
      {funnel.config.tracking?.ga4Id && (
        <>
          <script
            async
            src={`https://www.googletagmanager.com/gtag/js?id=${funnel.config.tracking.ga4Id}`}
          />
          <script
            dangerouslySetInnerHTML={{
              __html: `
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${funnel.config.tracking.ga4Id}');
              `,
            }}
          />
        </>
      )}

      {/* Landing Content */}
      <div className="container mx-auto px-4 py-16">
        <div className="mx-auto max-w-4xl text-center">
          {landing.image && (
            <div className="mb-8">
              <img
                src={landing.image}
                alt={landing.title}
                className="mx-auto max-h-96 rounded-lg object-cover"
              />
            </div>
          )}

          <h1
            className="mb-6 text-4xl font-bold md:text-5xl lg:text-6xl"
            style={{ color: primaryColor }}
          >
            {landing.title}
          </h1>

          <p className="mb-8 text-xl text-gray-600 md:text-2xl">
            {landing.subtitle}
          </p>

          <Button
            asChild
            size="lg"
            className="text-lg"
            style={{ backgroundColor: primaryColor }}
          >
            <Link href={formUrl.pathname + formUrl.search}>
              {landing.cta.text}
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

