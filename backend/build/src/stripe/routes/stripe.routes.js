"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const stripe_controller_1 = require("../controllers/stripe.controller");
router.post('/checkout/cart', stripe_controller_1.stripeController.createCheckoutSession);
router.get('/success', stripe_controller_1.stripeController.handleSuccess);
router.get('/cancel', stripe_controller_1.stripeController.handleCancel);
router.post('/webhook', express_1.default.raw({ type: 'application/json' }), stripe_controller_1.stripeController.handleWebhook);
exports.default = router;
//# sourceMappingURL=stripe.routes.js.map