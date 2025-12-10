/* eslint-disable no-console */
import type { Request, Response } from 'express';
import Commodity from '../../stripe/models/commodity.models';
import archiver from 'archiver';
import axios from 'axios';

export const exportProductImagesZip = async (_req: Request, res: Response) => {
  try {
    const products = await Commodity.find({}).lean();

    res.setHeader('Content-Type', 'application/zip');
    res.setHeader(
      'Content-Disposition',
      'attachment; filename="product_images.zip"'
    );

    const archive = archiver('zip', { zlib: { level: 9 } });
    archive.pipe(res);

    const VALID_PREFIX = 'https://cloud.appwrite.io/v1/storage/buckets/';

    for (const p of products) {
      if (!p.images?.length) { continue; }

      const folder =
        p.slug?.trim() ||
        p.uuid?.trim() ||
        p.name.replace(/\s+/g, '_').toLowerCase();

      for (let i = 0; i < p.images.length; i++) {
        const url = p.images[i];

        // 1) Ignore invalid URLs (like ".../bucketts/")
        if (!url.startsWith(VALID_PREFIX)) {
          archive.append(`INVALID URL (skipped): ${url}`, {
            name: `${folder}/ERROR_${i + 1}.txt`,
          });
          continue;
        }

        try {
          const response = await axios.get(url, {
            responseType: 'arraybuffer',
          });

          // 2) Always save as .jpg (safe)
          const filename = `${folder}/${i + 1}.jpg`;

          archive.append(Buffer.from(response.data), { name: filename });
        } catch (err) {
          console.warn(`⚠️ Failed download: ${url}`, err);

          archive.append(`DOWNLOAD FAILED: ${url}`, {
            name: `${folder}/ERROR_${i + 1}.txt`,
          });
        }
      }
    }

    await archive.finalize();
    return;
  } catch (error) {
    console.error('ZIP export error:', error);
    return res.status(500).json({
      status: false,
      message: 'Αποτυχία δημιουργίας ZIP',
    });
  }
};
