"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.stripeController = void 0;
/* eslint-disable no-console */
const logger_1 = __importDefault(require("../../utils/logger"));
const stripe_1 = __importDefault(require("stripe"));
const stripe_service_1 = require("../services/stripe.service");
const transaction_dao_1 = require("../daos/transaction.dao");
const errorHnadler_1 = require("../../utils/errorHnadler");
const participant_dao_1 = require("../daos/participant.dao");
const stripe_dao_1 = require("../daos/stripe.dao");
const cart_dao_1 = require("../daos/cart.dao");
const createCheckoutSession = async (req, res) => {
    const participantId = req.body.participantId;
    const participantInfo = req.body.participantInfo;
    const shippinginfo = req.body.shippingInfo;
    try {
        const cart = await (0, stripe_dao_1.fetchCart)(participantId);
        const session = await stripe_service_1.stripeService.createCheckoutSession(cart, participantInfo, shippinginfo);
        return res.status(200).json({ status: true, data: session });
    }
    catch (error) {
        return (0, errorHnadler_1.handleControllerError)(res, error);
    }
};
// επειδή το τεστ γινόνταν με κανονικα λεφτα κράτησα μερικα url επιστροφής. αν τα βάλεις στον browser θα συμπεριφερθει σαν επιτυχεία συναλαγής δημιουργόντας transaction και ανανεώνοντας τον participant.
// user:
//http://localhost:5173/checkout-success?session_id=cs_live_a1u5Qn0yiHn2hmITy0VHBIDEyT1LsWT7Xd4R7QQZTi4jFDVn3F4uLXSYyQ
// guest:
// http://localhost:5173/checkout-success?session_id=cs_live_a1Pw0WJbxkHY4HcPZr6zqZhuh1akVcWPrM4oHDpvMV8iEEnbnUaO5TFHsx
const handleSuccess = async (req, res) => {
    try {
        // συλλέγω διάφορα δεδομένα του χρήστη απο το url του success
        const sessionId = req.query.session_id;
        if (!sessionId) {
            // return res.status(400).json({ status: false, message: 'Missing session ID.' });
            // δεν θέλω να μου στείλει ένα json αλλα να με παει στην σελίδα λάθους. το json δεν θα έκανε render
            return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/cancel?error=missingSessionId`);
        }
        //prevent dublicate transactions
        const existingTransaction = await transaction_dao_1.transactionDAO.findBySessionId(sessionId);
        if (existingTransaction) {
            return res.status(409).json({ status: false, message: 'Transaction already recorded.' });
            // θα μπορούσα να το αλλάξω και να το κάνει να κάνει redirect στο success γιατι δεν είναι ακριβώς λάθος αλλα η συναλαγή έχει ήδη γίνει. Αλλα θα το αφήσω εδώ για να δείχνει οτι κάτι λάθος έγινε
        }
        // δεν είμαι σιγουρος τι κανει. αλλα μάλλον κάνει await το response
        const session = await stripe_service_1.stripeService.retrieveSession(sessionId);
        // Ensure payment actually succeeded
        if (session.payment_status !== 'paid') {
            return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/cancel?status=${session.payment_status || 'unknown'}`);
        }
        const name = session.metadata?.name || '';
        const surname = session.metadata?.surname || '';
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
        let participant = await participant_dao_1.participantDao.findParticipantByEmail(email);
        if (participant) {
            console.log(`Participant ${participant.email} found`);
        }
        if (!participant || !participant._id) {
            console.log('Participant not found, creating new one...');
            // δημιουργία νεου participant
            participant = await participant_dao_1.participantDao.createParticipant({ email: email, name: name, surname: surname });
        }
        // δημιουργία transaction
        const newTransaction = await transaction_dao_1.transactionDAO.createTransaction(participant._id, sessionId, shipping);
        console.log(newTransaction);
        // persist log 
        logger_1.default.info('Transaction created after Stripe success', {
            sessionId,
            participantId: participant._id.toString(),
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
        await cart_dao_1.cartDAO.clearCart(participant._id);
        // αντι να στείλουμε res.status(200) αφήνουμε να ολοκληρωθούν όλες οι backend λειτουργείες και μετά κάνουμε redirect στο success
        return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/checkout-success?session_id=${sessionId}`);
    }
    catch (error) {
        console.error('handleSuccess error:', error);
        return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/cancel?error=server`);
    }
};
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
const handleWebhook = async (req, res) => {
    if (!process.env.STRIPE_SECRET_KEY) {
        throw new Error('Missing STRIPE_SECRET_KEY env variable');
    }
    const stripe = new stripe_1.default(process.env.STRIPE_SECRET_KEY);
    try {
        // ✨ Unlike handleSuccess, we don’t read query params.
        // Webhooks POST a raw body + Stripe-Signature header.
        // αλλά παίρναμε το session id απο τα queries και με αυτό βρίσκαμε αν υπάρχει ήδη session. Πως γινετε εδώ αυτό;
        // In webhooks, Stripe calls your backend directly. (θα πρέπει οπότε να αλαχθεί και το front). Stripe also signs it with a special header Stripe-Signature.You must verify this signature to prove it’s from Stripe.
        const sig = req.headers['stripe-signature'];
        if (!sig) {
            return res.status(400).send('Missing Stripe signature');
        }
        let event;
        try {
            event = stripe.webhooks.constructEvent(req.body, // ⚠️ raw body, not parsed JSON - εδώ βρίσκετε πια το Payload μου με το shipping info και particippant info
            sig, process.env.STRIPE_WEBHOOK_SECRET);
        }
        catch (err) {
            console.error('⚠️ Webhook signature verification failed:', err);
            return res.status(400).send(`Webhook Error: ${err.message}`);
        }
        // ✨ Webhooks send many event types — we only care about checkout.session.completed
        // το session id για τον έλεγχο το παίρνουμε απο την απάντηση του webhook
        if (event.type === 'checkout.session.completed') {
            const session = event.data.object;
            const sessionId = session.id;
            // prevent duplicate transactions
            const existingTransaction = await transaction_dao_1.transactionDAO.findBySessionId(sessionId);
            if (existingTransaction) {
                // ✨ In webhook we just ack and return 200 (no redirect)
                return res.json({ received: true, message: 'Transaction already recorded' });
            }
            // Ensure payment actually succeeded
            if (session.payment_status !== 'paid') {
                return res.json({ received: true, message: `Payment status: ${session.payment_status}` });
            }
            const name = session.metadata?.name || '';
            const surname = session.metadata?.surname || '';
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
            let participant = await participant_dao_1.participantDao.findParticipantByEmail(email);
            if (participant) {
                console.log(`Participant ${participant.email} found`);
            }
            if (!participant || !participant._id) {
                console.log('Participant not found, creating new one...');
                participant = await participant_dao_1.participantDao.createParticipant({
                    email: email,
                    name: name,
                    surname: surname,
                });
            }
            // δημιουργία transaction
            const newTransaction = await transaction_dao_1.transactionDAO.createTransaction(participant._id, sessionId, shipping);
            console.log(newTransaction);
            // persist log
            logger_1.default.info('Transaction created after Stripe webhook', {
                sessionId,
                participantId: participant._id.toString(),
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
            await cart_dao_1.cartDAO.clearCart(participant._id);
        }
        // ✨ Webhook endpoints must return 200 quickly, no redirects
        return res.json({ received: true });
    }
    catch (error) {
        console.error('handleWebhook error:', error);
        return res.status(500).send('Webhook handler failed');
    }
};
const handleCancel = (_req, res) => {
    return res.send('Payment canceled! :(');
};
exports.stripeController = {
    createCheckoutSession,
    handleSuccess,
    handleWebhook,
    handleCancel
};
//# sourceMappingURL=stripe.controller.js.map