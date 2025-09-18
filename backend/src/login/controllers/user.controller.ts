/* eslint-disable no-console */
import bcrypt from 'bcrypt';
import User from '../models/users.models';
import { handleControllerError } from '../../utils/error/errorHandler';
import { userDAO } from '../dao/user.dao';

import type { Request, Response } from 'express';
import type { UpdateUser, AuthRequest } from '../types/user.types';

import { createZodUserSchema, updateZodUserSchema, createAdminSchema } from '../validation/auth.schema';

// δεν χρειάζετε return type γιατι το κάνει το dao
// create
// signup
export const createUser = async (req: Request, res: Response) => {
  try {
    // Omit γιατί εδώ έχουμε δημιουργία χρήστη οπότε πετάμε οτι και να μας έστειλε ως ρολο το φροντ και επιβάλουμε hardcoded user (λιγο παρακάτω)
    const data = createZodUserSchema.omit({ roles: true }).parse(req.body);

    const hashedPassword = await bcrypt.hash(data.password, 10);
    const existingUser = await User.findOne({ username: data.username });
    if (existingUser) {
      return res.status(409).json({ status: false, error: 'Username already taken' });
    }

    if (data.email) {
      const existingEmail = await User.findOne({ email: data.email });
      if (existingEmail) {
        return res.status(409).json({ status: false, error: 'Email already taken' });
      }
    }

    const newUser = await userDAO.create({
      username: data.username,
      name: data.name ?? '',
      email: data.email ?? '',
      roles: ['USER'], // always user
      hashedPassword
    });

    return res.status(201).json({ status: true, data: newUser });

  } catch (error) {
    return handleControllerError(res, error);
  }
};

//create admin
export const createAdmin = async (req: Request, res: Response) => {

  try {
    const data = createAdminSchema.parse(req.body); // Εδώ γίνεται το validation
    
    if (!data.username || !data.password){
      return res.status(400).json({ status: false, error: 'Missing required fields' });
    }

    const username = data.username;
    const name = data.name;
    const password = data.password;
    const email = data.email;
    const roles = data.roles;

    const SaltOrRounds = 10;
    const hashedPassword = await bcrypt.hash(password, SaltOrRounds);    

    const existingUser = await User.findOne({ username: data.username });
    if (existingUser) {
      return res.status(409).json({ status: false, error: 'Username already taken' });
    }

    if (email) {
      const existingEmail = await User.findOne({ email: data.email });
      if (existingEmail) {
        return res.status(409).json({ status: false, error: 'Email already taken' });
      }
    }

    const newUser = await userDAO.create({
      username,
      name: name ?? '',
      email: email ?? '',
      roles: roles ?? ['ADMIN'],
      hashedPassword
    });

    console.log(`Created new user: ${username}`);
    return res.status(201).json({ status: true, data: newUser });
    
  } catch (error) {
    return handleControllerError(res, error);
  }
};

// read
export const findAll = async (_req: Request, res: Response) => {
  try {
    const users = await userDAO.readAll();
    return res.status(200).json({ status: true, data: users });

  } catch (error) {
    return handleControllerError(res, error);
  }
};

export const readById = async (req: Request, res: Response) => {

  try {
    const userId: string | undefined = req.params.id;
    if (!userId) {
      return res.status(400).json({ status: false, error: 'no Id provided' });
    }

    const user = await userDAO.readById(userId);
    return res.status(200).json({ status: true, data: user });

  } catch (error) {
    return handleControllerError(res, error);
  }
};

export const readByUsername = async (req: Request, res: Response) => {

  try {
    const username: string | undefined = req.params.username;
    if (!username) {
      return res.status(400).json({ status: false, error: 'no username provided' });
    }

    const user = await userDAO.readByUsername(username);
    return res.status(200).json({ status: true, data: user });

  } catch (error) {
    return handleControllerError(res, error);
  }
};

export const readByEmail = async (req: Request, res: Response) => {
  try {
    const email = req.params.email;
    if (!email) {
      return res.status(400).json({ status: false, message: 'Email is required' });
    }

    const user = await userDAO.toServerByEmail(email);
    if (!user) {
      return res.status(404).json({ status: false, message: 'User not found' });
    } 

    return res.status(200).json({ status: true, data: user });
  } catch (error) {
    return handleControllerError(res, error);
  }
};

// update
export const toggleRoleById = async (req: AuthRequest, res: Response) => {
  const userIdToUpdate = req.params.id;
  const requestingUser = req.user;
  if (!requestingUser) {
    return res.status(401).json({ status: false, error: 'Unauthorized' });
  }
  if (requestingUser.id === userIdToUpdate) {
    return res.status(400).json({ status: false, error: 'You cannot remove your own admin role' });
  }

  try {
    const updatedUser = await userDAO.toggleRoleById(userIdToUpdate);
    if (!updatedUser) {
      return res.status(404).json({ status: false, error: 'User not found' });
    }
    return res.status(200).json({ status: true, data: updatedUser });
  } catch (error) {
    return handleControllerError(res, error);
  }
};

export const updateById = async (req: AuthRequest, res: Response) => {

  const userIdToUpdate = req.params.id;
  const requestingUser = req.user; // <-- This should be set by verifyToken middleware

  if (!requestingUser) {
    return res.status(401).json({ status: false, error: 'Unauthorized' });
  }

  // Allow if admin OR user updating own profile
  if (
    !requestingUser.roles.includes('ADMIN') &&
    requestingUser.id !== userIdToUpdate
  ) {
    return res.status(403).json({ status: false, error: 'Forbidden: Cannot update other users' });
  }

  // Validate request body
  const parseResult = updateZodUserSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({ status: false, errors: parseResult.error.issues.map(issue => issue.message) });
  }

  const data = { ...parseResult.data } as UpdateUser; // clone to avoid mutation

  const password = data.password;
  if (password) {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    data.hashedPassword = hashedPassword;
    delete data.password;
  }

  const userId: string | undefined = req.params.id;
  if (!userId) {
    return res.status(400).json({ status: false, error: 'no Id provided' });
  }

  try {
    // If username is to be updated, check uniqueness:
    // πρέπει να είναι μέσα στο try γιατί έχει μια await λειτουργία
    if (data.username) {
      const existingUser = await User.findOne({ username: data.username });
      if (existingUser && existingUser._id.toString() !== userId) {
        return res.status(409).json({ status: false, error: 'Username already taken' });
      }
    }

    const user = await userDAO.update(userId, data);
    return res.status(200).json({ status: true, data: user });

  } catch (error) {
    return handleControllerError(res, error);
  }
};

// delete
export const deleteById = async (req: Request, res: Response) => {

  const userId = req.params.id;
  if (!userId){
    return res.status(400).json({ status: false, error: 'User ID is required OR not found' });
  }

  try {
    const deleteUser = await userDAO.deleteById(userId);
    return res.status(200).json({ status: true, message: `User ${deleteUser.username} deleted successfully` });
  } catch (error) {
    return handleControllerError(res, error);
  }
};

export const userController = {
  createUser,
  createAdmin,
  findAll,
  readById,
  readByUsername,
  readByEmail,
  toggleRoleById,
  updateById,
  deleteById
};