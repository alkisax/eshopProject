/* eslint-disable no-console */
import { stripeService } from '../services/stripe.service';
import { transactionDAO } from '../daos/transaction.dao';
import type { Request, Response } from 'express';
import { handleControllerError } from '../../utils/errorHnadler';
import { participantDao } from '../daos/participant.dao';
import { Types } from 'mongoose';
// import logger from '../utils/logger';

const createCheckoutSession = async (req: Request, res: Response) => {
  const price_id = req.params.price_id;
  // added to catch participant url params
  const participantInfo = req.body.participantInfo;

  try {
    // added participantInfo to catch participant url params
    const session = await stripeService.createCheckoutSession(price_id, participantInfo);
    return res.status(200).json({ status: true, data: session });
  } catch (error) {
    return handleControllerError(res, error);
  }
};

// επειδή το τεστ γινόνταν με κανονικα λεφτα κράτησα μερικα url επιστροφής. αν τα βάλεις στον browser θα συμπεριφερθει σαν επιτυχεία συναλαγής δημιουργόντας transaction και ανανεώνοντας τον participant.
// test url http://localhost:5173//api/stripe/success?success=true&session_id=cs_live_a1mkTS6fqvKZOmhtC9av3fmJoVGLpTae5WARcA3vclGPqs1CgNUzRxm5iu
// test url http://localhost:5173/success?success=true&session_id=cs_live_a1n8TEyTBIrIsdg1taD0a2TjB5QaiCWTWSlGF6sslVeqXSnQgykb9yHDyp
// test url http://localhost:5173/success?success=true&session_id=cs_live_a16HqUdBc0VjlzlhfxfzMCDML6jYuvKoSXYusUdEwcTOO3RKCuperj2RB7
// deployed payment Eva Ntaliani alkisax@zohomail.eu
// https://revistedtarotbiasapp.onrender.com/success?success=true&session_id=cs_live_a18fcYxUMoQTz0x2vKDz1tBokiUjYrh3IQ6AkWCQ4sP4IfEwgSDa1kqYaN

const handleSuccess = async (req: Request, res: Response) => {
  try {
    // συλλέγω διάφορα δεδομένα του χρήστη απο το url του success
    const sessionId = req.query.session_id as string;
    if (!sessionId) {
      return res.status(400).json({ status: false, message: 'Missing session ID.' });
    }

    //prevent dublicate transactions
    const existingTransaction = await transactionDAO.findBySessionId(sessionId);
    if (existingTransaction) {
      return res.status(409).json({ status: false, message: 'Transaction already recorded.' });
    }

    // δεν είμαι σιγουρος τι κανει. αλλα μάλλον κάνει await το response
    const session = await stripeService.retrieveSession(sessionId);

    const name = session.metadata?.name || '';
    const surname = session.metadata?.surname || '';
    const email  = session.metadata?.email || ''; 

    if (!email) {
      return res.status(400).json({ status: false, message: 'Missing session ID.' });
    }

    // κάνω τα ευρώ σέντς
    if (!session.amount_total || session.amount_total === 0) {
      return res.status(400).json({ status: false, message: 'amount is 0' });
    }
    const amountTotal = session.amount_total / 100; // Stripe returns cents

    console.log(`Payment success for: ${email}, amount: ${amountTotal}`);

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
      sessionId
    );

    // push the new transaction’s _id into the participant’s transactions array
    // await participantDao.addTransactionToParticipant(
    //   participant._id!,
    //   newTransaction._id
    // );
    // console.log(`Added transaction ${newTransaction._id} to participant ${participant._id}`);

    return res.status(200).json({ status: true, data: newTransaction, message: 'Success! Your purchase has been recorded. You will soon recive an email with the progress. Thank you!' });
  } catch (error) {
    return handleControllerError(res, error);
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