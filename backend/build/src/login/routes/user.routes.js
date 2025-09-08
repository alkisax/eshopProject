"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const user_controller_1 = require("../controllers/user.controller");
const verification_middleware_1 = require("../middleware/verification.middleware");
// create
//signup
router.post('/signup/user', user_controller_1.userController.createUser);
//create admin
router.post('/signup/admin', verification_middleware_1.middleware.verifyToken, verification_middleware_1.middleware.checkRole('ADMIN'), user_controller_1.userController.createAdmin);
//read
router.get('/', verification_middleware_1.middleware.verifyToken, verification_middleware_1.middleware.checkRole('ADMIN'), user_controller_1.userController.findAll);
router.get('/username/:username', verification_middleware_1.middleware.verifyToken, verification_middleware_1.middleware.checkRole('ADMIN'), user_controller_1.userController.readByUsername);
router.get('/:id', verification_middleware_1.middleware.verifyToken, verification_middleware_1.middleware.checkRole('ADMIN'), user_controller_1.userController.readById);
router.get('/email/:email', verification_middleware_1.middleware.verifyToken, user_controller_1.userController.readByEmail);
// update
router.put('/:id', verification_middleware_1.middleware.verifyToken, user_controller_1.userController.updateById);
router.put('/toggle-admin/:id', verification_middleware_1.middleware.verifyToken, verification_middleware_1.middleware.checkRole('ADMIN'), user_controller_1.userController.toggleRoleById);
// delete
router.delete('/:id', verification_middleware_1.middleware.verifyToken, verification_middleware_1.middleware.checkRole('ADMIN'), user_controller_1.userController.deleteById);
exports.default = router;
//# sourceMappingURL=user.routes.js.map