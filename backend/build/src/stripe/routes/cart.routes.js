"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const cart_controller_1 = require("../controllers/cart.controller");
const verification_middleware_1 = require("../../login/middleware/verification.middleware");
const router = (0, express_1.Router)();
// Every cart is tied to a participant, so require auth
router.get('/', cart_controller_1.cartController.getAllCarts);
router.get('/:participantId', cart_controller_1.cartController.getCart);
router.post('/', cart_controller_1.cartController.createCart);
router.patch('/:participantId/items', cart_controller_1.cartController.addOrRemoveItem);
router.patch('/:participantId/items/update', cart_controller_1.cartController.updateQuantity);
router.delete('/:participantId', cart_controller_1.cartController.clearCart);
router.delete('/clear/old', verification_middleware_1.middleware.verifyToken, verification_middleware_1.middleware.checkRole('ADMIN'), cart_controller_1.cartController.deleteOldCarts);
exports.default = router;
//# sourceMappingURL=cart.routes.js.map