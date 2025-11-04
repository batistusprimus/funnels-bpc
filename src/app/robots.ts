import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/f/',
        disallow: ['/funnels/', '/leads/', '/api/', '/login', '/setup'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}

