/* eslint-disable no-console */
// backend/src/sitemap/sitemap.routes.ts
import { Router } from 'express';
import { generateSitemapXml } from './sitemap.service';

const router = Router();

router.get('/sitemap.xml', async (_req, res) => {
  try {
    const xml = await generateSitemapXml();
    res.setHeader('Content-Type', 'application/xml');
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.send(xml);
  } catch (err) {
    console.error('Sitemap error', err);
    res.status(500).send('Failed to generate sitemap');
  }
});

export default router;
