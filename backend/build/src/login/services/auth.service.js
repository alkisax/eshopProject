"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authService = void 0;
/* eslint-disable no-console */
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const google_auth_library_1 = require("google-auth-library");
const user_dao_1 = require("../dao/user.dao");
const generateAccessToken = (user) => {
    const payload = {
        id: user._id,
        username: user.username,
        name: user.name,
        email: user.email,
        roles: user.roles,
        hasPassword: !!user.hashedPassword,
    };
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        throw new Error('JWT secret is not defined in environment variables');
    }
    const options = {
        expiresIn: '1h'
    };
    const token = jsonwebtoken_1.default.sign(payload, secret, options);
    return token;
};
const verifyPassword = async (password, hashedPassword) => {
    return await bcrypt_1.default.compare(password, hashedPassword);
};
const verifyAccessToken = (token) => {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        throw new Error('JWT secret is not defined in environment variables');
    }
    try {
        const payload = jsonwebtoken_1.default.verify(token, secret);
        return {
            verified: true, data: payload
        };
    }
    catch (error) {
        if (error instanceof Error) {
            return { verified: false, data: error.message };
        }
        else {
            return { verified: false, data: 'unknown error' };
        }
    }
};
const verifyAndFetchUser = async (token) => {
    const verification = verifyAccessToken(token);
    if (!verification.verified) {
        return { verified: false, reason: verification.data };
    }
    const payload = verification.data;
    try {
        const user = await user_dao_1.userDAO.readById(payload.id);
        return { verified: true, user };
    }
    catch {
        return { verified: false, reason: 'User not found' };
    }
};
const getTokenFrom = (req) => {
    const authorization = req.get('authorization');
    if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
        const token = authorization.replace('Bearer ', '');
        return token;
    }
    return null;
};
const googleAuth = async (code, redirectUri) => {
    // google cloude -> conosole -> Api&Services -> credentials
    const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
    const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
    if (!CLIENT_ID) {
        throw new Error('Google Client ID is missing from environment variables');
    }
    const oauth2Client = new google_auth_library_1.OAuth2Client(CLIENT_ID, CLIENT_SECRET, redirectUri);
    try {
        // Exchange code for tokens
        const { tokens } = await oauth2Client.getToken(code);
        oauth2Client.setCredentials(tokens);
        if (!tokens.id_token) {
            throw new Error('ID token is missing from Google response');
        }
        const ticket = await oauth2Client.verifyIdToken({
            idToken: tokens.id_token,
            audience: CLIENT_ID
        });
        // console.log("Step 2")
        const userInfo = ticket.getPayload();
        // console.log("Google User", userInfo);
        return { user: userInfo, tokens };
    }
    catch (error) {
        console.log('Error in google authentication', error);
        return { error: 'Failed to authenticate with google' };
    }
};
exports.authService = {
    generateAccessToken,
    verifyPassword,
    verifyAccessToken,
    verifyAndFetchUser,
    getTokenFrom,
    googleAuth
};
//# sourceMappingURL=auth.service.js.map