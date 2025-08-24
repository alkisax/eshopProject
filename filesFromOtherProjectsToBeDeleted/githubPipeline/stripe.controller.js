const stripeService = require('../services/stripe.service');
const transactionDAO = require('../daos/transaction.dao');
const participantDAO = require('../daos/participant.dao');
const logger = require('../utils/logger')

const createCheckoutSession = async (req, res) => {
  const price_id = req.params.price_id;
  // added to catch participant url params
  const participantInfo = req.body.participantInfo;


  try {
    // added participantInfo to catch participant url params
    const session = await stripeService.createCheckoutSession(price_id, participantInfo);
    res.json(session);
  } catch (error) {
    console.error('Error creating checkout session:', error.message);
    res.status(500).json({ error: error.message });
  }
};

// επειδή το τεστ γινόνταν με κανονικα λεφτα κράτησα μερικα url επιστροφής. αν τα βάλεις στον browser θα συμπεριφερθει σαν επιτυχεία συναλαγής δημιουργόντας transaction και ανανεώνοντας τον participant.
// test url http://localhost:5173//api/stripe/success?success=true&session_id=cs_live_a1mkTS6fqvKZOmhtC9av3fmJoVGLpTae5WARcA3vclGPqs1CgNUzRxm5iu
// test url http://localhost:5173/success?success=true&session_id=cs_live_a1n8TEyTBIrIsdg1taD0a2TjB5QaiCWTWSlGF6sslVeqXSnQgykb9yHDyp
// test url http://localhost:5173/success?success=true&session_id=cs_live_a16HqUdBc0VjlzlhfxfzMCDML6jYuvKoSXYusUdEwcTOO3RKCuperj2RB7
// deployed payment Eva Ntaliani alkisax@zohomail.eu
// https://revistedtarotbiasapp.onrender.com/success?success=true&session_id=cs_live_a18fcYxUMoQTz0x2vKDz1tBokiUjYrh3IQ6AkWCQ4sP4IfEwgSDa1kqYaN
const handleSuccess = async (req, res) => {
  try {
    // συλλέγω διάφορα δεδομένα του χρήστη απο το url του success
    const sessionId = req.query.session_id;
    if (!sessionId) {
      return res.status(400).send('Missing session ID.');
    }

    //prevent dublicate transactions
    const existingTransaction = await transactionDAO.findBySessionId(sessionId);
    if (existingTransaction) {
      return res.status(200).send("Transaction already recorded.");
    }

    // δεν είμαι σιγουρος τι κανει. αλλα μάλλον κάνει await το response
    const session = await stripeService.retrieveSession(sessionId);

    const name = session.metadata.name
    const surname = session.metadata.surname
    const email  = session.metadata.email 

    if (!email) {
      return res.status(400).send('Missing session ID.');
    }

    // κάνω τα ευρώ σέντς
    const amountTotal = session.amount_total / 100; // Stripe returns cents

    console.log(`Payment success for: ${email}, amount: ${amountTotal}`);

    // ψαχνω τον participant απο το ημαιλ του για να τον ανανεώσω αν υπάρχει ή ν α τον δημιουργήσω
    let participant = await participantDAO.findParticipantByEmail(email);

    if (participant) {
      console.log(`Participant ${participant.email} found`);      
    }

    if (!participant) {
      console.log('Participant not found, creating new one...');
      // δημιουργία νεου participant
      participant = await participantDAO.createParticipant({ email: email, name: name, surname: surname });
    }

    // δημιουργία transaction
    const newTransaction = await transactionDAO.createTransaction({
      amount: amountTotal,
      processed: false,
      participant: participant._id
    });
    console.log("new transaction>>>", newTransaction);

    // push the new transaction’s _id into the participant’s transactions array
    await participantDAO.addTransactionToParticipant(
      participant._id,
      newTransaction._id
    );
    console.log(`Added transaction ${newTransaction._id} to participant ${participant._id}`);
    

    return res.send('Success! Your donation was recorded. Thank you!');
  } catch (error) {
    console.error('Error processing success route:', error.message);
    return res.status(500).send('Something went wrong.');
  }
};

const handleCancel = (req, res) => {
  return res.send('Payment canceled! :(');
};

module.exports = {
  createCheckoutSession,
  handleSuccess,
  handleCancel
};