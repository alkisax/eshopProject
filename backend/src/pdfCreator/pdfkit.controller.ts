// backend\src\pdfCreator\pdfkit.controller.ts
/* eslint-disable no-console */
import type { Request, Response } from 'express';
import PDFDocument from 'pdfkit';
import { transactionDAO } from '../stripe/daos/transaction.dao';
import { settingsDAO } from '../settings/settings.dao';
import { handleControllerError } from '../utils/error/errorHandler';
import path from 'path';

export const createInternalOrderPdf = async (
  req: Request,
  res: Response
): Promise<void> => {
  console.log('[PDFKIT] START');

  try {
    const transactionId = req.params.transactionId;
    console.log('[PDFKIT] transactionId:', transactionId);

    const transaction = await transactionDAO.findTransactionById(transactionId);

    const participant =
      typeof transaction.participant === 'object'
        ? transaction.participant
        : null;

    if (!participant?.email) {
      throw new Error('Participant email not found');
    }

    const settings = await settingsDAO.getGlobalSettings();

    // DATA
    const companyName = settings.companyInfo?.companyName ?? '-';
    const companyAddress = settings.companyInfo?.address ?? '-';
    const companyPhone = settings.companyInfo?.phone ?? '-';

    const orderNumber = transaction._id.toString();
    const createdAt = new Date(
      transaction.createdAt ?? Date.now()
    ).toLocaleString();

    // PDF SETUP
    const doc = new PDFDocument({ size: 'A4', margin: 50 });

    const fontPath = path.join(
      process.cwd(),
      'src/pdfCreator/fonts/AtCorfu-Regular.otf'
    );

    doc.font(fontPath);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=internal-order-${orderNumber}.pdf`
    );

    doc.pipe(res);

    // HEADER
    doc.fontSize(18).text(companyName, { align: 'left' }).moveDown(0.3);

    doc
      .fontSize(10)
      .text(companyAddress)
      .text(`Phone: ${companyPhone}`)
      .moveDown();

    doc
      .fontSize(14)
      .text('Internal Order', { align: 'right' })
      .fontSize(10)
      .text(`Order #: ${orderNumber}`, { align: 'right' })
      .text(`Date: ${createdAt}`, { align: 'right' });

    doc.moveDown(2);

    // CUSTOMER
    doc.fontSize(12).text('Customer', { underline: true }).moveDown(0.5);

    doc
      .fontSize(10)
      .text(`Name: ${participant.name ?? '-'}`)
      .text(`Email: ${participant.email}`)
      .moveDown();

    // SHIPPING
    if (transaction.shipping) {
      const s = transaction.shipping;

      doc
        .fontSize(12)
        .text('Shipping Address', { underline: true })
        .moveDown(0.5);

      doc
        .fontSize(10)
        .text(s.fullName)
        .text(s.addressLine1)
        .text(s.addressLine2 ?? '')
        .text(`${s.postalCode} ${s.city}`)
        .text(s.country)
        .text(`Phone: ${s.phone ?? '-'}`);

      if (s.notes) {
        doc
          .moveDown(0.5)
          .fontSize(9)
          .fillColor('gray')
          .text(`Notes: ${s.notes}`)
          .fillColor('black');
      }

      doc.moveDown();
    }

    // ITEMS TABLE (manual)
    doc.fontSize(12).text('Items', { underline: true }).moveDown(0.5);

    const startX = doc.x;
    let y = doc.y;

    doc.fontSize(10);
    doc.text('#', startX, y);
    doc.text('Product', startX + 30, y);
    doc.text('Qty', startX + 300, y);
    doc.text('Price', startX + 350, y);

    y += 15;
    doc.moveTo(startX, y).lineTo(550, y).stroke();
    y += 10;

    transaction.items.forEach((item, index) => {
      const commodity =
        item.commodity &&
        typeof item.commodity === 'object' &&
        'name' in item.commodity
          ? item.commodity
          : null;

      const productName = commodity?.name ?? 'Product';

      const variant =
        item.variantId && commodity?.variants
          ? commodity.variants.find(
            (v) => v._id?.toString() === item.variantId?.toString()
          )
          : null;

      doc.text(String(index + 1), startX, y);
      doc.text(productName, startX + 30, y, { width: 250 });
      doc.text(String(item.quantity), startX + 300, y);
      doc.text(`${item.priceAtPurchase} €`, startX + 350, y);

      y += 14;

      if (variant?.attributes) {
        const attributes =
          variant.attributes instanceof Map
            ? Object.fromEntries(variant.attributes.entries())
            : variant.attributes;

        const variantLabel = Object.entries(attributes)
          .map(([k, v]) => `${k}: ${v}`)
          .join(', ');

        doc
          .fontSize(9)
          .fillColor('gray')
          .text(`Variant: ${variantLabel}`, startX + 30, y);

        doc.fillColor('black');
        y += 12;
      }

      y += 6;
    });

    doc.moveDown(2);

    // TOTAL
    doc.fontSize(12).text(`Total: ${transaction.amount} €`, {
      align: 'right',
    });

    doc.end();

    console.log('[PDFKIT] END');
  } catch (error) {
    console.error('[PDFKIT] ERROR:', error);
    handleControllerError(res, error);
  }
};

export const createShippingInfoPdf = async (
  req: Request,
  res: Response
): Promise<void> => {
  console.log('[PDFKIT][SHIPPING] START');

  try {
    const transactionId = req.params.transactionId;
    console.log('[PDFKIT][SHIPPING] transactionId:', transactionId);

    const transaction = await transactionDAO.findTransactionById(transactionId);

    if (!transaction.shipping) {
      throw new Error('No shipping info found for this transaction');
    }

    const s = transaction.shipping;
    const settings = await settingsDAO.getGlobalSettings();

    const companyName = settings.companyInfo?.companyName ?? '-';
    const companyPhone = settings.companyInfo?.phone ?? '-';

    const orderNumber = transaction._id.toString();
    const createdAt = new Date(
      transaction.createdAt ?? Date.now()
    ).toLocaleString();

    // PDF SETUP
    const doc = new PDFDocument({ size: 'A4', margin: 50 });

    const fontPath = path.join(
      process.cwd(),
      'src/pdfCreator/fonts/AtCorfu-Regular.otf'
    );

    doc.font(fontPath);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=shipping-info-${orderNumber}.pdf`
    );

    doc.pipe(res);

    // HEADER
    doc.fontSize(18).text(companyName, { align: 'left' }).moveDown(0.3);
    doc.fontSize(10).text(`Phone: ${companyPhone}`).moveDown();

    doc
      .fontSize(14)
      .text('Shipping Information', { align: 'right' })
      .fontSize(10)
      .text(`Order #: ${orderNumber}`, { align: 'right' })
      .text(`Date: ${createdAt}`, { align: 'right' });

    doc.moveDown(3);

    // SHIPPING BLOCK (printable label style)
    doc.fontSize(12).text('Recipient', { underline: true }).moveDown(0.5);

    doc.fontSize(14).text(s.fullName).moveDown(0.3);

    doc.fontSize(12).text(s.addressLine1);

    if (s.addressLine2) {
      doc.text(s.addressLine2);
    }

    doc.text(`${s.postalCode} ${s.city}`).text(s.country).moveDown();

    doc.fontSize(10).text(`Phone: ${s.phone ?? '-'}`);

    if (s.notes) {
      doc.moveDown().fontSize(9).text(`Notes: ${s.notes}`);
    }

    doc.end();

    console.log('[PDFKIT][SHIPPING] END');
  } catch (error) {
    console.error('[PDFKIT][SHIPPING] ERROR:', error);
    handleControllerError(res, error);
  }
};

/**
 * examplePdf
 * ΔΕΝ χρησιμοποιείται παραγωγικά.
 * ❌ Δεν τραβά δεδομένα από DB
 * ❌ Δεν έχει business logic
 */
export const examplePdf = async (
  _req: Request,
  res: Response
): Promise<void> => {
  console.log('[PDFKIT][EXAMPLE] START');

  try {
    // Δημιουργούμε νέο PDF document
    const doc = new PDFDocument({
      size: 'A4',
      margin: 50,
    });

    /**
     * Φορτώνουμε custom font
     * - αν το font path είναι λάθος → runtime crash
     * - γι’ αυτό το κρατάμε ίδιο με τα υπόλοιπα PDFs
     */
    const fontPath = path.join(
      process.cwd(),
      'src/pdfCreator/fonts/AtCorfu-Regular.otf'
    );

    doc.font(fontPath);

    /**
     * HTTP headers
     * - attachment → force download
     * - όχι preview στον browser
     */
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=example.pdf');

    /**
     * Συνδέουμε το PDF stream απευθείας στο response
     * ❗ Δεν δημιουργούμε buffer στη μνήμη
     * ❗ Πιο σταθερό σε VPS
     */
    doc.pipe(res);

    // ======================
    // ΠΕΡΙΕΧΟΜΕΝΟ PDF
    // ======================

    doc
      .fontSize(20)
      .text('PDFKit Example PDF', { align: 'center' })
      .moveDown(2);

    doc
      .fontSize(11)
      .text('Χρησιμοποιείται μόνο για δοκιμές (smoke-test) και debugging.', {
        align: 'left',
      })
      .moveDown(2);

    doc.fontSize(10).text(`Generated at: ${new Date().toLocaleString()}`, {
      align: 'right',
    });

    /**
     * Κλείνουμε το PDF stream
     * ⚠️ ΧΩΡΙΣ αυτό, το response δεν τελειώνει ποτέ
     */
    doc.end();

    console.log('[PDFKIT][EXAMPLE] END');
  } catch (error) {
    console.error('[PDFKIT][EXAMPLE] ERROR:', error);
    handleControllerError(res, error);
  }
};
