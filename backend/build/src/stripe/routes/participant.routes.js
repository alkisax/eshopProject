"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const participant_controller_1 = require("../controllers/participant.controller");
const verification_middleware_1 = require("../../login/middleware/verification.middleware");
router.post('/', participant_controller_1.participantController.create);
router.get('/', verification_middleware_1.middleware.verifyToken, verification_middleware_1.middleware.checkRole('ADMIN'), participant_controller_1.participantController.findAll);
router.get('/by-email', participant_controller_1.participantController.findByEmail);
router.get('/:id', participant_controller_1.participantController.findById);
router.delete('/:id', verification_middleware_1.middleware.verifyToken, verification_middleware_1.middleware.checkRole('ADMIN'), participant_controller_1.participantController.deleteById);
router.delete('/clear/old-guests', verification_middleware_1.middleware.verifyToken, verification_middleware_1.middleware.checkRole('ADMIN'), participant_controller_1.participantController.deleteOldGuestParticipants);
exports.default = router;
//# sourceMappingURL=participant.routes.js.map