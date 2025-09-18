import { userDAO } from '../dao/user.dao';
import { handleControllerError } from '../../error/errorHnadler';
import type { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { IUser } from '../types/user.types';
import { syncUserSchema } from '../validation/auth.schema';

const secret = process.env.JWT_SECRET || 'secret';

export const syncUser = async (req: Request, res: Response) => {
  try {
    // const { email } = req.body;
    const parsed = syncUserSchema.parse(req.body);
    const { email } = parsed;

    if (!email) {
      return res.status(400).json({ status: false, data: 'error fetching user from appwrite' });
    }

    let dbUser = await userDAO.toServerByEmail(email);

    if (!dbUser) {
      // Generate a random password for Appwrite/Google users (you won't need it)
      const mockedHashedPassword = await bcrypt.hash(Math.random().toString(36), 10);

      await userDAO.create({
        username: email.split('@')[0],
        name: email.split('@')[0],
        email: email,
        roles: ['USER'],
        hashedPassword: mockedHashedPassword
      });

      dbUser = await userDAO.toServerByEmail(email) as IUser; // now dbUser is IUser
    }

    const provider = req.body.provider || 'appwrite';
    
    const payload = {
      id: dbUser._id,
      username: dbUser.username,
      name: dbUser.name,
      email: dbUser.email,
      roles: dbUser.roles,
      hasPassword: !!dbUser.hashedPassword,  // ✅ boolean flag
      provider 
    };

    const token = jwt.sign(payload, secret, { expiresIn: '1d' });

    return res.status(200).json({ status: true, data: { user: { ...dbUser.toObject(), provider }, token } });
  } catch (error) {
    return handleControllerError(res, error);
  }
};

export const authAppwriteController = {
  syncUser
};
