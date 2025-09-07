"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleControllerError = handleControllerError;
function handleControllerError(res, error) {
    if (error instanceof Error) {
        console.error(error);
        const statusCode = error.statusCode !== undefined ?
            error.statusCode : 500;
        return res.status(statusCode).json({ status: false, message: error.message });
    }
    return res.status(500).json({ status: false, error: 'Unknown error' });
}
//# sourceMappingURL=errorHnadler.js.map