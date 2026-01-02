// backend\src\pdfCreator\pdf.controller.ts
// https://www.youtube.com/watch?v=Di0lsxQoI9k
import puppeteer from 'puppeteer';
import type { Request, Response } from 'express';
import { handleControllerError } from '../utils/error/errorHandler';
import { transactionDAO } from '../stripe/daos/transaction.dao';
import { settingsDAO } from '../settings/settings.dao';
import { internalOrderHtml } from './internalOrder.template';
import { shippingInfoHtml } from './shippingInfo.template';

// για να φτιάξουμε το pdf μας θα χρησιμοποιήσουμε έναν headless browser. H διαδικασία είναι φτιάχνω τον browser → του δημιουργώ ένα tab (page) → του δείνω html περιεχόμενο → σώζω την σελίδα ως pdf buffer → στελνω το pdf με res
export const createInternalOrderPdf = async (req: Request, res: Response) => {
  // αρχικοποιώ τον browser εκτος try γιατι θα τον κλείσω με finally. θέλω να κλείσει και στο κακό σενάριο
  let browser;

  try {
    // τα headless/args προστέθηκαν γιατι θα έχω προβλήματα σε Hetzner
    browser = await puppeteer.launch({
      headless: true, // ⚠️⚠️⚠️
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();

    // απο εδώ και πέρα μαζεύουμε ολες τις πληροφορίες μας για να μπούν στο pdf (η λογική θα μοιάζει πολύ με το μεηλ)
    const transactionId = req.params.transactionId;
    const transaction = await transactionDAO.findTransactionById(transactionId);

    const participant =
      typeof transaction.participant === 'object'
        ? transaction.participant
        : null;

    if (!participant?.email) {
      throw new Error('Participant email not found');
    }

    const settings = await settingsDAO.getGlobalSettings();

    const companyName = settings.companyInfo?.companyName ?? '-';
    const companyAddress = settings.companyInfo?.address ?? '-';
    const companyPhone = settings.companyInfo?.phone ?? '-';

    const orderNumber = transaction._id.toString();
    const customerName = participant.name ?? '-';
    const customerEmail = participant.email;
    const total = `${transaction.amount} €`;
    const createdAt = new Date(
      transaction.createdAt ?? Date.now()
    ).toLocaleString();

    const shipping = transaction.shipping;

    // ITEMS HTML
    const itemsHtml = transaction.items
      .map((item, index) => {
        const productName =
          typeof item.commodity === 'object' && 'name' in item.commodity
            ? item.commodity.name
            : 'Product';

        return `
          <tr>
            <td>${index + 1}</td>
            <td>${productName}</td>
            <td>${item.quantity}</td>
            <td>${item.priceAtPurchase} €</td>
          </tr>
        `;
      })
      .join('');

    // HTML TEMPLATE (SAFE)
    const html = internalOrderHtml({
      companyName,
      companyAddress,
      companyPhone,
      orderNumber,
      createdAt,
      customerName,
      customerEmail,
      itemsHtml,
      shippingHtml: shipping
        ? `${shipping.fullName}<br/>
       ${shipping.addressLine1}<br/>
       ${shipping.addressLine2 ?? ''}<br/>
       ${shipping.postalCode} ${shipping.city}<br/>
       ${shipping.country}<br/>
       Phone: ${shipping.phone ?? '-'}`
        : 'No shipping info',
      total,
    });

    // RENDER PDF
    await page.setContent(html, { waitUntil: 'load' });

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
    });

    const filename = `internal-order-${orderNumber}.pdf`;
    // 'Content-Disposition' → για να είναι downloadable και οχι preview
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}"`,
    });

    return res.status(200).send(pdfBuffer);
  } catch (error) {
    return handleControllerError(res, error);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
};

export const shippingInfoPdf = async (req: Request, res: Response) => {
  let browser;

  try {
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();

    const transactionId = req.params.transactionId;
    const transaction = await transactionDAO.findTransactionById(transactionId);

    const participant =
      typeof transaction.participant === 'object'
        ? transaction.participant
        : null;

    if (!participant?.email) {
      throw new Error('Participant email not found');
    }

    const settings = await settingsDAO.getGlobalSettings();

    const companyName = settings.companyInfo?.companyName ?? '-';
    const companyAddress = settings.companyInfo?.address ?? '-';
    const companyPhone = settings.companyInfo?.phone ?? '-';

    const orderNumber = transaction._id.toString();
    const customerName = participant.name ?? '-';
    const customerEmail = participant.email;

    const shipping = transaction.shipping;

    const shippingHtml = shipping
      ? `${shipping.fullName}<br/>
         ${shipping.addressLine1}<br/>
         ${shipping.addressLine2 ?? ''}<br/>
         ${shipping.postalCode} ${shipping.city}<br/>
         ${shipping.country}<br/>
         Phone: ${shipping.phone ?? '-'}`
      : 'No shipping info';

    const html = shippingInfoHtml({
      companyName,
      companyAddress,
      companyPhone,
      orderNumber,
      customerName,
      customerEmail,
      shippingHtml,
    });

    await page.setContent(html, { waitUntil: 'load' });

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
    });

    const filename = `shipping-info-${orderNumber}.pdf`;

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}"`,
    });

    return res.status(200).send(pdfBuffer);
  } catch (error) {
    return handleControllerError(res, error);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
};

// example not for use
const examplePdf = async (_req: Request, res: Response) => {
  // αρχικοποιώ τον browser εκτος try γιατι θα τον κλείσω με finally. θέλω να κλείσει και στο κακό σενάριο
  let browser;
  try {
    // τα headless/args προστέθηκαν γιατι θα έχω προβλήματα σε Hetzner
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    const page = await browser.newPage();
    // waitUntil: 'networkidle0' → το await του puppeteer για να έχει γίνει fetch το περιεχόμεο πριν την δημιουργεία του pdf
    await page.setContent('<h1>hello</h1>', { waitUntil: 'networkidle0' });

    const pdfBuffer = await page.pdf();

    // 'Content-Disposition' → για να είναι downloadable και οχι preview
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename=invoice.pdf',
    });

    return res.status(200).contentType('application/pdf').send(pdfBuffer);
  } catch (error) {
    return handleControllerError(res, error);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
};

export const pdfController = {
  createInternalOrderPdf,
  shippingInfoPdf,
  examplePdf,
};
