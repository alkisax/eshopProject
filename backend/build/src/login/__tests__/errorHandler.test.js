"use strict";
/* eslint-disable no-console */
Object.defineProperty(exports, "__esModule", { value: true });
const errorHnadler_1 = require("../services/errorHnadler");
const zod_1 = require("zod");
describe('handleControllerError', () => {
    let res;
    let statusMock;
    let jsonMock;
    beforeEach(() => {
        jsonMock = jest.fn();
        statusMock = jest.fn().mockReturnValue({ json: jsonMock });
        res = { status: statusMock };
        jest.spyOn(console, 'error').mockImplementation(() => { });
    });
    afterAll(() => {
        console.error.mockRestore();
    });
    it('handles ZodError', () => {
        const zodError = new zod_1.ZodError([{ path: ['username'], message: 'Required' }]);
        (0, errorHnadler_1.handleControllerError)(res, zodError);
        expect(statusMock).toHaveBeenCalledWith(400);
        expect(jsonMock).toHaveBeenCalledWith({
            status: false,
            errors: zodError.issues,
        });
    });
    it('handles Error with status', () => {
        const error = new Error('Not found');
        error.status = 404;
        (0, errorHnadler_1.handleControllerError)(res, error);
        expect(statusMock).toHaveBeenCalledWith(404);
        expect(jsonMock).toHaveBeenCalledWith({ status: false, error: 'Not found' });
    });
    it('handles Error without status', () => {
        const error = new Error('Server failed');
        (0, errorHnadler_1.handleControllerError)(res, error);
        expect(statusMock).toHaveBeenCalledWith(500);
        expect(jsonMock).toHaveBeenCalledWith({ status: false, error: 'Server failed' });
    });
    it('handles unknown error', () => {
        (0, errorHnadler_1.handleControllerError)(res, 'oops');
        expect(statusMock).toHaveBeenCalledWith(500);
        expect(jsonMock).toHaveBeenCalledWith({ status: false, error: 'Unknown error' });
    });
});
//# sourceMappingURL=errorHandler.test.js.map