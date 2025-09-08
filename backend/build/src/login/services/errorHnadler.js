"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleControllerError = handleControllerError;
const zod_1 = require("zod");
function handleControllerError(res, error) {
    if (error instanceof zod_1.ZodError) {
        return res.status(400).json({ status: false, errors: error.issues });
    }
    if (error instanceof Error) {
        console.error(error);
        const statusCode = error.status || 500;
        return res.status(statusCode).json({ status: false, error: error.message });
    }
    return res.status(500).json({ status: false, error: 'Unknown error' });
}
//# sourceMappingURL=errorHnadler.js.map