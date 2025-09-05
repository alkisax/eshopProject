/* eslint-disable no-console */
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
    

    // αδειάζω το cart
    await cartDAO.clearCart(participant._id!);

    // αντι να στείλουμε res.status(200) αφήνουμε να ολοκληρωθούν όλες οι backend λειτουργείες και μετά κάνουμε redirect στο success
    return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/checkout-success?session_id=${sessionId}`);

  } catch (error) {
    console.error('handleSuccess error:', error);
    return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/cancel?error=server`);
  }
};

const handleCancel = (_req: Request, res: Response) => {
  return res.send('Payment canceled! :(');
};

export const stripeController = {
  createCheckoutSession,
  handleSuccess,
  handleCancel
};