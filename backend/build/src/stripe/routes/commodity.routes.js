"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const commodity_controller_1 = require("../controllers/commodity.controller");
const verification_middleware_1 = require("../../login/middleware/verification.middleware");
const router = (0, express_1.Router)();
// 📖 Public: list and view commodities
router.get('/', commodity_controller_1.commodityController.findAll);
router.get('/categories', commodity_controller_1.commodityController.getAllCategories);
router.get('/:id', commodity_controller_1.commodityController.findById);
// 🛒 Admin: create, update, delete commodities
router.post('/', verification_middleware_1.middleware.verifyToken, verification_middleware_1.middleware.checkRole('ADMIN'), commodity_controller_1.commodityController.create);
// PATCH: decrease stock & increase soldCount
router.patch('/sell/:id', verification_middleware_1.middleware.verifyToken, verification_middleware_1.middleware.checkRole('ADMIN'), commodity_controller_1.commodityController.sellById);
router.patch('/:id', verification_middleware_1.middleware.verifyToken, verification_middleware_1.middleware.checkRole('ADMIN'), commodity_controller_1.commodityController.updateById);
router.delete('/:id', verification_middleware_1.middleware.verifyToken, verification_middleware_1.middleware.checkRole('ADMIN'), commodity_controller_1.commodityController.deleteById);
// 💬 Comments
// Logged-in user can add a comment
router.post('/:id/comments', verification_middleware_1.middleware.verifyToken, commodity_controller_1.commodityController.addComment);
// Admin can clear all comments
router.delete('/:id/comments', verification_middleware_1.middleware.verifyToken, verification_middleware_1.middleware.checkRole('ADMIN'), commodity_controller_1.commodityController.clearComments);
// Admin can delete a specific comment
router.delete('/:id/comments/:commentId', verification_middleware_1.middleware.verifyToken, verification_middleware_1.middleware.checkRole('ADMIN'), commodity_controller_1.commodityController.deleteComment);
exports.default = router;
//# sourceMappingURL=commodity.routes.js.map