/* eslint-disable no-console */
import logger from '../../utils/logger';
import Stripe from 'stripe';
import { stripeService } from '../services/stripe.service';
import { transactionDAO } from '../daos/transaction.dao';
import type { Request, Response } from 'express';
import { handleControllerError } from '../../utils/errorHnadler';
import { participantDao } from '../daos/participant.dao';
import { Types } from 'mongoose';
import { fetchCart } from '../daos/stripe.dao';
import { CartType } from '../types/stripe.types';
import { cartDAO } from '../daos/cart.dao';

const createCheckoutSession = async (req: Request, res: Response) => {
  const participantId = req.body.participantId;
  const participantInfo = req.body.participantInfo;
  const shippinginfo = req.body.shippingInfo;

  try {
    const cart: CartType = await fetchCart(participantId);
    const session = await stripeService.createCheckoutSession(cart, participantInfo, shippinginfo);
    return res.status(200).json({ status: true, data: session });
  } catch (error) {
    return handleControllerError(res, error);
  }
};

// επειδή το τεστ γινόνταν με κανονικα λεφτα κράτησα μερικα url επιστροφής. αν τα βάλεις στον browser θα συμπεριφερθει σαν επιτυχεία συναλαγής δημιουργόντας transaction και ανανεώνοντας τον participant.
// user:
//http://localhost:5173/checkout-success?session_id=cs_live_a1u5Qn0yiHn2hmITy0VHBIDEyT1LsWT7Xd4R7QQZTi4jFDVn3F4uLXSYyQ
// guest:
// http://localhost:5173/checkout-success?session_id=cs_live_a1Pw0WJbxkHY4HcPZr6zqZhuh1akVcWPrM4oHDpvMV8iEEnbnUaO5TFHsx

// DO NOT DELETE - working handlesucces - commented out to use webhook
/*
const handleSuccess = async (req: Request, res: Response) => {
  try {
    // συλλέγω διάφορα δεδομένα του χρήστη απο το url του success
    const sessionId = req.query.session_id as string;
    if (!sessionId) {
      // return res.status(400).json({ status: false, message: 'Missing session ID.' });
      // δεν θέλω να μου στείλει ένα json αλλα να με παει στην σελίδα λάθους. το json δεν θα έκανε render
      return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/cancel?error=missingSessionId`);
    }

    //prevent dublicate transactions
    const existingTransaction = await transactionDAO.findBySessionId(sessionId);
    if (existingTransaction) {
      return res.status(409).json({ status: false, message: 'Transaction already recorded.' });
      // θα μπορούσα να το αλλάξω και να το κάνει να κάνει redirect στο success γιατι δεν είναι ακριβώς λάθος αλλα η συναλαγή έχει ήδη γίνει. Αλλα θα το αφήσω εδώ για να δείχνει οτι κάτι λάθος έγινε
    }

    // δεν είμαι σιγουρος τι κανει. αλλα μάλλον κάνει await το response
    const session = await stripeService.retrieveSession(sessionId);

    // Ensure payment actually succeeded
    if (session.payment_status !== 'paid') {
      return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/cancel?status=${session.payment_status || 'unknown'}`);
    }

    const name = session.metadata?.name || '';
    const surname = session.metadata?.surname || '';
    const email  = session.metadata?.email || ''; 
    const shipping = {
      shippingEmail: session.metadata?.shippingEmail || '',
      fullName: session.metadata?.fullName || '',
      addressLine1: session.metadata?.addressLine1 || '',
      addressLine2: session.metadata?.addressLine2 || '',
      city: session.metadata?.city || '',
      postalCode: session.metadata?.postalCode || '',
      country: session.metadata?.country || '',
      phone: session.metadata?.phone || '',
      notes: session.metadata?.notes || '',
    };

    if (!email) {
      // οχι json αλλα redirect στην σελλίδα λάθους
      return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/cancel?error=noEmailMetadata`);
    }

    // κάνω τα ευρώ σέντς
    if (!session.amount_total || session.amount_total === 0) {
      return res.status(400).json({ status: false, message: 'amount is 0' });
    }
    const amountTotal = session.amount_total / 100; // Stripe returns cents

    console.log(`Payment success for: ${email}, amount: ${amountTotal}`);
    console.log('shipping address: ', shipping);

    // ψαχνω τον participant απο το ημαιλ του για να τον ανανεώσω αν υπάρχει ή να τον δημιουργήσω
    let participant = await participantDao.findParticipantByEmail(email);

    if (participant) {
      console.log(`Participant ${participant.email} found`);      
    }

    if (!participant || !participant._id) {
      console.log('Participant not found, creating new one...');
      // δημιουργία νεου participant
      participant = await participantDao.createParticipant({ email: email, name: name, surname: surname });
    }

    // δημιουργία transaction
    const newTransaction = await transactionDAO.createTransaction(
      participant._id as Types.ObjectId,
      sessionId,
      shipping
    );
    console.log(newTransaction);

    // persist log 
    logger.info('Transaction created after Stripe success', {
      sessionId,
      participantId: participant._id!.toString(),
      email: participant.email,
      amount: newTransaction.amount,
      shipping,
      items: newTransaction.items.map((i) => ({
        commodity: i.commodity.toString(),
        quantity: i.quantity,
        priceAtPurchase: i.priceAtPurchase
      }))
    });
    

    // αδειάζω το cart
    await cartDAO.clearCart(participant._id!);

    // αντι να στείλουμε res.status(200) αφήνουμε να ολοκληρωθούν όλες οι backend λειτουργείες και μετά κάνουμε redirect στο success
    return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/checkout-success?session_id=${sessionId}`);

  } catch (error) {
    console.error('handleSuccess error:', error);
    return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/cancel?error=server`);
  } 
};
*/

// επειδή η επικοινωνία στο webhook είναι server to server εδώ σταματάω και θα ανεβάσω την εφαρμογή στο render για να είναι ο backend live και να μην πρέπει να κάνω expose το back port με ngrok
/*
What changes compared to handleSuccess
No query params: Stripe posts JSON to you, not query strings.
No redirects: Webhooks return only 200 OK or an error, never a redirect.
Raw body: You must use express.raw({ type: 'application/json' }) on this route only, otherwise Stripe’s signature verification fails.
Signature validation: stripe.webhooks.constructEvent(req.body, sig, STRIPE_WEBHOOK_SECRET) ensures the event is genuine.
Timing: The webhook may arrive even if the user never comes back to your site.
*/

// Stripe Dashboard → Developers → Webhooks → Add endpoint → your account → 🔎 chekcout → checkout.session.completed → wenhook endpoint → https://eshopproject-ggmn.onrender.com/api/stripe/webhook


// ⚠️ Important: this route must use express.raw({ type: 'application/json' })
// instead of express.json(), otherwise signature verification will fail.
const handleWebhook = async (req: Request, res: Response) => {
  console.log('🔥 Stripe webhook hit');

  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('Missing STRIPE_SECRET_KEY env variable');    
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

  try {
    // 🟢 Debug logs
    console.log('Headers:', req.headers);
    console.log('Raw body length:', req.body?.length || 'not raw');
    // ✨ Unlike handleSuccess, we don’t read query params.
    // Webhooks POST a raw body + Stripe-Signature header.
    // αλλά παίρναμε το session id απο τα queries και με αυτό βρίσκαμε αν υπάρχει ήδη session. Πως γινετε εδώ αυτό;
    // In webhooks, Stripe calls your backend directly.το front κάνει μόνο το initiate της διαδικασίας. Stripe also signs it with a special header Stripe-Signature.You must verify this signature to prove it’s from Stripe.
    const sig = req.headers['stripe-signature'];
    if (!sig) {
      console.error('❌ Missing Stripe signature header');
      return res.status(400).send('Missing Stripe signature');
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(
        req.body, // ⚠️ raw body, not parsed JSON - εδώ βρίσκετε πια το Payload μου με το shipping info και particippant info
        sig,
        process.env.STRIPE_WEBHOOK_SECRET as string
      );
    } catch (err) {
      console.error('⚠️ Webhook signature verification failed:', err);
      return res.status(400).send(`Webhook Error: ${(err as Error).message}`);
    }

    console.log('✅ Verified event type:', event.type);

    // ✨ Webhooks send many event types — we only care about checkout.session.completed
    // το session id για τον έλεγχο το παίρνουμε απο την απάντηση του webhook
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      console.log('💰 Session completed:', {
        id: session.id,
        email: session.metadata?.email,
        amount: session.amount_total
      });

      const sessionId = session.id;

      // prevent duplicate transactions
      const existingTransaction = await transactionDAO.findBySessionId(sessionId);
      if (existingTransaction) {
        // ✨ In webhook we just ack and return 200 (no redirect)
        return res.json({ received: true, message: 'Transaction already recorded' });
      }

      // Ensure payment actually succeeded
      if (session.payment_status !== 'paid') {
        return res.json({ received: true, message: `Payment status: ${session.payment_status}` });
      }

      // const name = session.metadata?.name || '';
      // const surname = session.metadata?.surname || '';
      const email = session.metadata?.email || '';
      const shipping = {
        shippingEmail: session.metadata?.shippingEmail || '',
        fullName: session.metadata?.fullName || '',
        addressLine1: session.metadata?.addressLine1 || '',
        addressLine2: session.metadata?.addressLine2 || '',
        city: session.metadata?.city || '',
        postalCode: session.metadata?.postalCode || '',
        country: session.metadata?.country || '',
        phone: session.metadata?.phone || '',
        notes: session.metadata?.notes || '',
      };

      if (!email) {
        // ✨ In webhook we don’t redirect — just log and return
        console.error('No email metadata in session');
        return res.json({ received: true, error: 'noEmailMetadata' });
      }

      // κάνω τα ευρώ σέντς
      if (!session.amount_total || session.amount_total === 0) {
        return res.json({ received: true, error: 'amount is 0' });
      }
      const amountTotal = session.amount_total / 100; // Stripe returns cents

      console.log(`Payment success for: ${email}, amount: ${amountTotal}`);
      console.log('shipping address: ', shipping);

      // ψαχνω τον participant απο το ημαιλ του για να τον ανανεώσω αν υπάρχει ή να τον δημιουργήσω
      // let participant = await participantDao.findParticipantByEmail(email);

      // if (participant) {
      //   console.log(`Participant ${participant.email} found`);
      // }

      // if (!participant || !participant._id) {
      //   console.log('Participant not found, creating new one...');
      //   participant = await participantDao.createParticipant({
      //     email: email,
      //     name: name,
      //     surname: surname,
      //   });
      // }

      const participantId = session.metadata?.participantId;
      if (!participantId) {
        throw new Error('Missing participantId in Stripe session metadata');
      }
      const participant = await participantDao.findParticipantById(participantId);
      if (!participant) {
        throw new Error(`Participant ${participantId} not found`);
      }

      // δημιουργία transaction
      const newTransaction = await transactionDAO.createTransaction(
        participant._id as Types.ObjectId,
        sessionId,
        shipping
      );
      console.log(newTransaction);

      // persist log
      logger.info('Transaction created after Stripe webhook', {
        sessionId,
        participantId: participant._id!.toString(),
        email: participant.email,
        amount: newTransaction.amount,
        shipping,
        items: newTransaction.items.map((i) => ({
          commodity: i.commodity.toString(),
          quantity: i.quantity,
          priceAtPurchase: i.priceAtPurchase,
        })),
      });

      // αδειάζω το cart
      try {
        await cartDAO.clearCart(participant._id!);
      } catch (err) {
        if (err instanceof Error) {
          console.warn('Cart clear skipped:', err.message);
        } else {
          console.warn('Cart clear skipped:', err);
        }
      }
    }

    // ✨ Webhook endpoints must return 200 quickly, no redirects
    return res.json({ received: true });
  } catch (error) {
    console.error('handleWebhook error:', error);
    return res.status(500).send('Webhook handler failed');
  }
};

const handleCancel = (_req: Request, res: Response) => {
  return res.send('Payment canceled! :(');
};

export const stripeController = {
  createCheckoutSession,
  // handleSuccess,
  handleWebhook,
  handleCancel
};