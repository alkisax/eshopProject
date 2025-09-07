"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const router = (0, express_1.Router)();
const transactionController_1 = require("../controllers/transactionController");
const verification_middleware_1 = require("../../login/middleware/verification.middleware");
// GET all transactions (admin only)
router.get('/', verification_middleware_1.middleware.verifyToken, verification_middleware_1.middleware.checkRole('ADMIN'), transactionController_1.transactionController.findAll);
// GET unprocessed transactions (admin only)
router.get('/unprocessed', verification_middleware_1.middleware.verifyToken, verification_middleware_1.middleware.checkRole('ADMIN'), transactionController_1.transactionController.findUnprocessed);
// get all transactions by participant id. to create an "previous pirchaces" - needs login or else can acces other people transactions
router.get('/participant/:participantId', verification_middleware_1.middleware.verifyToken, transactionController_1.transactionController.findByParticipant);
// POST create a new transaction (no auth yet)
router.post('/', transactionController_1.transactionController.create);
// DELETE a transaction by ID (admin only)
router.delete('/:id', verification_middleware_1.middleware.verifyToken, verification_middleware_1.middleware.checkRole('ADMIN'), transactionController_1.transactionController.deleteById);
// αυτο είναι σημαντικό γιατι στέλνει το αυτόματο ημαιλ
router.put('/toggle/:id', verification_middleware_1.middleware.verifyToken, verification_middleware_1.middleware.checkRole('ADMIN'), transactionController_1.transactionController.toggleProcessed);
router.delete('/clear/old', verification_middleware_1.middleware.verifyToken, verification_middleware_1.middleware.checkRole('ADMIN'), transactionController_1.transactionController.deleteOldProcessedTransactions);
exports.default = router;
//# sourceMappingURL=transaction.routes.js.map