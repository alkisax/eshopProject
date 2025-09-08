"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authAppwriteController = exports.syncUser = void 0;
const user_dao_1 = require("../dao/user.dao");
const errorHnadler_1 = require("../services/errorHnadler");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const secret = process.env.JWT_SECRET || 'secret';
const syncUser = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ status: false, data: 'error fetching user from appwrite' });
        }
        let dbUser = await user_dao_1.userDAO.toServerByEmail(email);
        if (!dbUser) {
            // Generate a random password for Appwrite/Google users (you won't need it)
            const mockedHashedPassword = await bcrypt_1.default.hash(Math.random().toString(36), 10);
            await user_dao_1.userDAO.create({
                username: email.split('@')[0],
                name: email.split('@')[0],
                email: email,
                roles: ['USER'],
                hashedPassword: mockedHashedPassword
            });
            dbUser = await user_dao_1.userDAO.toServerByEmail(email); // now dbUser is IUser
        }
        const provider = req.body.provider || 'appwrite';
        const payload = {
            id: dbUser._id,
            username: dbUser.username,
            name: dbUser.name,
            email: dbUser.email,
            roles: dbUser.roles,
            hasPassword: !!dbUser.hashedPassword, // ✅ boolean flag
            provider
        };
        const token = jsonwebtoken_1.default.sign(payload, secret, { expiresIn: '1d' });
        return res.status(200).json({ status: true, data: { user: { ...dbUser.toObject(), provider }, token } });
    }
    catch (error) {
        return (0, errorHnadler_1.handleControllerError)(res, error);
    }
};
exports.syncUser = syncUser;
exports.authAppwriteController = {
    syncUser: exports.syncUser
};
//# sourceMappingURL=auth.appwrite.controller.js.map