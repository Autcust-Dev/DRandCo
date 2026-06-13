import type { APIRoute } from 'astro';
import { db } from '../lib/firebase';

const SITE_URL = 'https://drandco.com';

export const GET: APIRoute = async () => {
  try {
    const urls = [];
    
    // Add static pages
    urls.push(`${SITE_URL}/`);
    
    // Fetch apps
    const appsSnapshot = await db.collection('apps').get();
    appsSnapshot.forEach((doc) => {
      urls.push(`${SITE_URL}/apps/${doc.id}`);
    });

    // Fetch policies
    const policiesSnapshot = await db.collection('policies').get();
    policiesSnapshot.forEach((doc) => {
      urls.push(`${SITE_URL}/policies/${doc.id}`);
    });

    // Fetch docs
    const docsSnapshot = await db.collection('docs').get();
    docsSnapshot.forEach((doc) => {
      urls.push(`${SITE_URL}/docs/${doc.id}`);
    });

    // Fetch menus and recursively map items
    const menusSnapshot = await db.collection('menus').get();
    
    const parseItems = (items: any[]) => {
      if (!Array.isArray(items)) return;
      
      items.forEach(item => {
        if (item.type === 'page' && item.slug) {
          urls.push(`${SITE_URL}/p/${item.slug}`);
        } else if (item.type === 'link' && item.url) {
          if (item.url.startsWith('/')) {
             urls.push(`${SITE_URL}${item.url === '/' ? '' : item.url}`);
          }
        } else if (item.type === 'submenu' && item.items) {
          parseItems(item.items); // Recursive call for grandchildren
        }
      });
    };

    menusSnapshot.docs.forEach((doc) => {
      const data = doc.data();
      if (data.items) {
        parseItems(data.items);
      }
    });

    const uniqueUrls = [...new Set(urls)];

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${uniqueUrls.map((url) => `
  <url>
    <loc>${url}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>`).join('')}
</urlset>`;

    return new Response(sitemap.trim(), {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600'
      },
    });
  } catch (error) {
    console.error('Error generating sitemap:', error);
    return new Response('Error generating sitemap', { status: 500 });
  }
};

