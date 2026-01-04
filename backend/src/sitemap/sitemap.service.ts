// backend\src\sitemap\sitemap.service.ts
import Commodity from '../stripe/models/commodity.models';
import Category from '../stripe/models/category.models';

export const generateSitemapXml = async (): Promise<string> => {
  const baseUrl = process.env.FRONTEND_URL;
  if (!baseUrl) {
    throw new Error('FRONTEND_URL is not defined');
  }

  const urls: string[] = [];

  // static pages
  urls.push(`
    <url>
      <loc>${baseUrl}</loc>
    </url>
  `);

  urls.push(`
    <url>
      <loc>${baseUrl}/commodities</loc>
    </url>
  `);

  // commodities (products)
  const commodities = await Commodity.find(
    {
      active: true,
      slug: { $ne: null },
    },
    'slug updatedAt'
  );

  commodities.forEach((c) => {
    urls.push(`
      <url>
        <loc>${baseUrl}/commodity/${c.slug}</loc>
        <lastmod>${c.updatedAt?.toISOString()}</lastmod>
      </url>
    `);
  });

  // categories
  const categories = await Category.find(
    { active: true },
    'slug'
  );

  categories.forEach((cat) => {
    urls.push(`
      <url>
        <loc>${baseUrl}/category/${cat.slug}</loc>
      </url>
    `);
  });

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>`;
};