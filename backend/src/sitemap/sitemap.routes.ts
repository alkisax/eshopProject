/* eslint-disable no-console */
// backend/src/sitemap/sitemap.routes.ts

// χρειάστικε αυτό ο deployed nginx 
/*
  location = /sitemap.xml {
    proxy_pass http://localhost:3001/sitemap.xml;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }
*/
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
