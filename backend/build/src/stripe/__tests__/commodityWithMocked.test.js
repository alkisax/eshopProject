"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const commodity_controller_1 = require("../controllers/commodity.controller");
const commodity_dao_1 = require("../daos/commodity.dao");
// import { ValidationError } from '../types/errors.types';
// import request from 'supertest';
// import { hash } from 'bcrypt';
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
// process.env.STRIPE_SECRET_KEY = 'sk_test_dummy';
// process.env.FRONTEND_URL = 'http://localhost:5173';
jest.mock('../daos/commodity.dao');
// jest.mock('../../utils/appwrite.ts', () => ({
//   account: {
//     get: jest.fn(),
//     create: jest.fn(),
//     deleteSession: jest.fn(),
//   },
//   OAuthProvider: { Google: 'google' },
// }));
// jest.mock('../../login/services/auth.service.ts', () => ({
//   authService: {
//     ...jest.requireActual('../../login/services/auth.service.ts').authService,
//     googleAuth: jest.fn(),  // stubbed out
//   },
// }));
// import app from '../../app';
// import User from '../../login/models/users.models';
// import Commodity from '../models/commodity.models';
// import { connect, disconnect } from 'mongoose';
const mockRes = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
};
describe('Commodity Controller - Unit tests for branches', () => {
    it('should return 400 if no id in findById', async () => {
        const req = { params: {} };
        const res = mockRes();
        await commodity_controller_1.commodityController.findById(req, res);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ status: false, error: 'Commodity ID is required' });
    });
    it('should return 400 if no id in updateById', async () => {
        const req = { params: {}, body: {} };
        const res = mockRes();
        await commodity_controller_1.commodityController.updateById(req, res);
        expect(res.status).toHaveBeenCalledWith(400);
    });
    it('should return 400 if no id in deleteById', async () => {
        const req = { params: {} };
        const res = mockRes();
        await commodity_controller_1.commodityController.deleteById(req, res);
        expect(res.status).toHaveBeenCalledWith(400);
    });
    it('should return 400 if no id in addComment', async () => {
        const req = { params: {}, body: { user: '123', text: 'hi' } };
        const res = mockRes();
        await commodity_controller_1.commodityController.addComment(req, res);
        expect(res.status).toHaveBeenCalledWith(400);
    });
    it('should return 400 if no user/text in addComment', async () => {
        const req = { params: { id: '1' }, body: {} };
        const res = mockRes();
        await commodity_controller_1.commodityController.addComment(req, res);
        expect(res.status).toHaveBeenCalledWith(400);
    });
    it('should return 400 if no id in clearComments', async () => {
        const req = { params: {} };
        const res = mockRes();
        await commodity_controller_1.commodityController.clearComments(req, res);
        expect(res.status).toHaveBeenCalledWith(400);
    });
    it('should handle DAO error in findAll', async () => {
        commodity_dao_1.commodityDAO.findAllCommodities.mockRejectedValue(new Error('DB fail'));
        const req = { query: {} };
        const res = mockRes();
        await commodity_controller_1.commodityController.findAll(req, res);
        expect(res.status).toHaveBeenCalledWith(500);
    });
});
//# sourceMappingURL=commodityWithMocked.test.js.map