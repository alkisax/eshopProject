"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userDAO = exports.toUserDAO = void 0;
const users_models_1 = __importDefault(require("../models/users.models"));
// Response DAO (safe to send to client no hashed pass)
const toUserDAO = (user) => {
    return {
        id: user._id.toString(),
        username: user.username,
        name: user.name,
        email: user.email,
        roles: user.roles,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
    };
};
exports.toUserDAO = toUserDAO;
const create = async (userData) => {
    const user = new users_models_1.default({
        username: userData.username,
        name: userData.name,
        email: userData.email,
        roles: userData.roles ?? ['user'],
        hashedPassword: userData.hashedPassword
    });
    const response = await user.save();
    if (!response) {
        throw new Error('error saving user');
    }
    return (0, exports.toUserDAO)(response);
};
const readAll = async () => {
    const response = await users_models_1.default.find();
    if (response.length === 0) {
        throw new Error('No users found');
    }
    return response.map((user) => (0, exports.toUserDAO)(user));
};
const readById = async (userId) => {
    const user = await users_models_1.default.findById(userId);
    if (!user) {
        throw new Error('User not found');
    }
    return (0, exports.toUserDAO)(user);
};
const readByUsername = async (username) => {
    const user = await users_models_1.default.findOne({ username: username });
    if (!user) {
        throw new Error(`User with username ${username} not found`);
    }
    return (0, exports.toUserDAO)(user);
};
const toServerById = async (userId) => {
    const user = await users_models_1.default.findById(userId);
    if (!user) {
        throw new Error('User not found');
    }
    return user;
};
const toServerByEmail = async (email) => {
    const user = await users_models_1.default.findOne({ email: email });
    return user ? user : null;
};
const toServerbyUsername = async (username) => {
    const user = await users_models_1.default.findOne({ username: username });
    // if (!user) throw new Error(`User with username ${username} not found`);
    return user ? user : null;
};
const update = async (userId, userData) => {
    const response = await users_models_1.default.findByIdAndUpdate(userId, userData, { new: true });
    if (!response) {
        throw new Error('User does not exist');
    }
    return (0, exports.toUserDAO)(response);
};
const toggleRoleById = async (userId) => {
    const user = await users_models_1.default.findById(userId);
    if (!user) {
        return null;
    }
    user.roles = user.roles.includes('ADMIN') ? ['USER'] : ['ADMIN'];
    // save only roles, skip validation on other required fields
    user.markModified('roles');
    await user.save({ validateBeforeSave: false });
    return (0, exports.toUserDAO)(user);
};
const deleteById = async (userId) => {
    const response = await users_models_1.default.findByIdAndDelete(userId);
    if (!response) {
        const error = new Error('User does not exist');
        error.status = 404;
        throw error;
    }
    return (0, exports.toUserDAO)(response);
};
exports.userDAO = {
    toUserDAO: exports.toUserDAO,
    create,
    readAll,
    readById,
    readByUsername,
    toServerById,
    toServerByEmail,
    toServerbyUsername,
    update,
    toggleRoleById,
    deleteById
};
//# sourceMappingURL=user.dao.js.map