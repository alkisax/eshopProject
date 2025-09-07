"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.participantController = exports.deleteById = exports.findById = exports.findByEmail = exports.findAll = exports.create = void 0;
/* eslint-disable no-console */
const participant_dao_1 = require("../daos/participant.dao");
const errorHnadler_1 = require("../../utils/errorHnadler");
const create = async (req, res) => {
    // if user comes from middleware use this else use whats comming from front
    const userId = req.user?.id || req.body.user;
    const data = req.body;
    const name = data.name;
    const surname = data.surname;
    const email = data.email;
    const transactions = data.transactions;
    try {
        const newParticipant = await participant_dao_1.participantDao.createParticipant({
            name,
            surname,
            email,
            user: userId,
            transactions
        });
        console.log(`Created new participant: ${email}`);
        return res.status(201).json({ startus: true, data: newParticipant });
    }
    catch (error) {
        return (0, errorHnadler_1.handleControllerError)(res, error);
    }
};
exports.create = create;
const findAll = async (req, res) => {
    try {
        if (!req.headers.authorization) {
            return res.status(401).json({ status: false, error: 'No token provided' });
        }
        const participants = await participant_dao_1.participantDao.findAllParticipants();
        console.log('Fetched all participants');
        return res.status(200).json({ status: true, data: participants });
    }
    catch (error) {
        return (0, errorHnadler_1.handleControllerError)(res, error);
    }
};
exports.findAll = findAll;
const findByEmail = async (req, res) => {
    try {
        const email = req.query.email;
        if (!email) {
            return res.status(400).json({ status: false, error: 'Email is required' });
        }
        const participant = await participant_dao_1.participantDao.findParticipantByEmail(email);
        return res.status(200).json({ status: true, data: participant });
    }
    catch (error) {
        return (0, errorHnadler_1.handleControllerError)(res, error);
    }
};
exports.findByEmail = findByEmail;
const findById = async (req, res) => {
    try {
        const id = req.params.id;
        if (!id) {
            return res.status(400).json({ status: false, error: 'id is required' });
        }
        const participant = await participant_dao_1.participantDao.findParticipantById(id);
        return res.status(200).json({ status: true, data: participant });
    }
    catch (error) {
        return (0, errorHnadler_1.handleControllerError)(res, error);
    }
};
exports.findById = findById;
const deleteById = async (req, res) => {
    const participantId = req.params.id;
    if (!participantId) {
        console.log('Delete attempt without ID');
        return res.status(400).json({ status: false, error: 'participant ID is required OR not found' });
    }
    try {
        const deleteParticipant = await participant_dao_1.participantDao.deleteParticipantById(participantId);
        if (!deleteParticipant) {
            console.log(`Delete failed: participant ${participantId} not found`);
            return res.status(404).json({
                status: false,
                error: 'Error deleting participant: not found'
            });
        }
        else {
            console.log(`Deleted participant ${deleteParticipant.email}`);
            return res.status(200).json({ status: true, message: `participant ${deleteParticipant.email} deleted successfully` });
        }
    }
    catch (error) {
        return (0, errorHnadler_1.handleControllerError)(res, error);
    }
};
exports.deleteById = deleteById;
const deleteOldGuestParticipants = async (_req, res) => {
    try {
        const deletedCount = await participant_dao_1.participantDao.deleteOldGuestParticipants(5);
        res.status(200).json({
            status: true,
            message: `${deletedCount} guest participants older than 5 days were deleted.`,
        });
    }
    catch (error) {
        (0, errorHnadler_1.handleControllerError)(res, error);
    }
};
exports.participantController = {
    create: exports.create,
    findAll: exports.findAll,
    findByEmail: exports.findByEmail,
    findById: exports.findById,
    deleteById: exports.deleteById,
    deleteOldGuestParticipants,
};
//# sourceMappingURL=participant.controller.js.map