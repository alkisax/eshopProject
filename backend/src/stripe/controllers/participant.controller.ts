/* eslint-disable no-console */
import { participantDao } from '../daos/participant.dao';
import { handleControllerError } from '../../utils/errorHnadler';
import type { Request, Response } from 'express';
// αντι να φτιάξουμε νέο interface το κάναμε ιμπορτ το ιδιο που είχε και το middleware
import type { AuthRequest } from '../../login/types/user.types';

export const create = async (req: AuthRequest , res: Response) => {

  // if user comes from middleware use this else use whats comming from front
  const userId = req.user?.id || req.body.user;
  const data = req.body;

  const name = data.name;
  const surname = data.surname;
  const email = data.email;
  const transactions = data.transactions;

  try {
    const newParticipant = await participantDao.createParticipant({
      name,
      surname,
      email,
      user: userId,
      transactions
    });

    console.log(`Created new participant: ${email}`);
    return res.status(201).json({ startus: true, data: newParticipant });
  } catch (error) {
    return handleControllerError(res, error);
  }
};

export const findAll = async (req: Request, res: Response) => {
  try {
    if (!req.headers.authorization) {
      return res.status(401).json({ status: false, error: 'No token provided' });
    }

    const participants = await participantDao.findAllParticipants();

    console.log('Fetched all participants');
    return res.status(200).json({ status: true, data: participants });

  } catch (error) {
    return handleControllerError(res, error);
  }
};

export const findByEmail = async (req: Request, res: Response) => {
  try {
    const email = req.query.email as string;
    if (!email) {
      return res.status(400).json({ status: false, error: 'Email is required' });
    }

    const participant = await participantDao.findParticipantByEmail(email);
    return res.status(200).json({ status: true, data: participant });
  } catch (error) {
    return handleControllerError(res, error);
  }
};

export const findById = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    if (!id) {
      return res.status(400).json({ status: false, error: 'id is required' });
    }

    const participant = await participantDao.findParticipantById(id);
    return res.status(200).json({ status: true, data: participant });
  } catch (error) {
    return handleControllerError(res, error);
  }
};


export const deleteById = async (req: Request, res: Response) => {
  const participantId = req.params.id;
  if (!participantId){
    console.log('Delete attempt without ID');
    return res.status(400).json({ status: false, error: 'participant ID is required OR not found' });
  }
  
  try {
    const deleteParticipant = await participantDao.deleteParticipantById(participantId);

    if (!deleteParticipant){
      console.log(`Delete failed: participant ${participantId} not found`);
      return res.status(404).json({
        status: false,
        error: 'Error deleting participant: not found'
      });
    } else {

      console.log(`Deleted participant ${deleteParticipant.email}`);
      return res.status(200).json({ status: true, message: `participant ${deleteParticipant.email} deleted successfully` });

    }
  } catch (error) {
    return handleControllerError(res, error);
  }
};

const deleteOldGuestParticipants = async (_req: Request, res: Response): Promise<void> => {
  try {
    const deletedCount = await participantDao.deleteOldGuestParticipants(5);
    res.status(200).json({
      status: true,
      message: `${deletedCount} guest participants older than 5 days were deleted.`,
    });
  } catch (error) {
    handleControllerError(res, error);
  }
};

export const participantController = {
  create,
  findAll,
  findByEmail,
  findById,
  deleteById,
  deleteOldGuestParticipants,
};