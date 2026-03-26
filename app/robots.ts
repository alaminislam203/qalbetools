import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: '/api/', // Keep API routes private from scrapers
    },
    sitemap: 'https://qalbetools.vercel.app/sitemap.xml',
  };
}
