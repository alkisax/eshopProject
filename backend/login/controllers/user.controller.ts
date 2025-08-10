import bcrypt from 'bcrypt'
import User from '../models/users.models.js'
import { z } from 'zod'
// import authService from '../services/auth.service.js'
import { userDAO } from '../dao/user.dao.js'

import type { Request, Response } from 'express';
import type { CreateUser, UpdateUser } from '../types/user.types'

const createZodUserSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string()
    .min(6, "Password must be at least 6 characters")
    .regex(/[A-Z]/, { message: "Password must contain at least one uppercase letter" })
    .regex(/[!@#$%^&*(),.?":{}|<>]/, { message: "Password must contain at least one special character" }),
  name: z.string().optional(),
  email: z.email({ message: "Invalid email address" }).optional(),
  roles: z.array(z.string()).optional(),
});

// δεν χρειάζετε return type γιατι το κάνει το dao
// create
export const create = async (req: Request, res: Response) => {

  let data = createZodUserSchema.parse(req.body) as CreateUser // Εδώ γίνεται το validation
  
  if (!data.username || !data.password){
    return res.status(400).json({ status: false, error: 'Missing required fields' });
  }

  const username = data.username
  const name = data.name
  const password = data.password
  const email = data.email
  const roles = data.roles

  const SaltOrRounds = 10
  const hashedPassword = await bcrypt.hash(password, SaltOrRounds)

  try {

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
      roles: roles ?? ['user'],
      hashedPassword
    });

    console.log(`Created new user: ${username}`);
    res.status(201).json({ status: true, data: newUser })
    
  } catch (error: unknown) {
    if (error instanceof Error) {
    console.error(error);
      res.status(500).json({ status: false, error: error.message });
    } else {
      res.status(500).json({ status: false, error: 'Unknown error' });
    }
  }
}

// read
export const findAll = async (req: Request, res: Response) => {
  try {

    // TODO auth headers? or just exist?
    if (!req.headers.authorization) {
      return res.status(401).json({ status: false, error: 'No token provided' });
    }

    const users = await userDAO.readAll();
    res.status(200).json({ status: true, data: users });

  } catch (error: unknown) {
    if (error instanceof Error) {
    console.error(error);
      res.status(500).json({ status: false, error: error.message });
    } else {
      res.status(500).json({ status: false, error: 'Unknown error' });
    }
  }
}

export const readById = async (req: Request, res: Response) => {

  // TODO auth headers? or just exist?
  if (!req.headers.authorization) {
    return res.status(401).json({ status: false, error: 'No token provided' });
  }

  try {
    const userId: string | undefined = req.params.id
    if (!userId) {
      res.status(400).json({ status: false, error: 'no Id provided'})
      return
    }

    const user = await userDAO.readById(userId)
    res.status(200).json({ status: true, data: user })

  } catch (error: unknown) {
    if (error instanceof Error) {
    console.error(error);
      res.status(500).json({ status: false, error: error.message });
    } else {
      res.status(500).json({ status: false, error: 'Unknown error' });
    }
  }
}

export const readByUsername = async (req: Request, res: Response) => {

  // TODO auth headers? or just exist?
  if (!req.headers.authorization) {
    return res.status(401).json({ status: false, error: 'No token provided' });
  }

  try {
    const username: string | undefined = req.params.username
    if (!username) {
      res.status(400).json({ status: false, error: 'no username provided'})
      return
    }

    const user = await userDAO.readByUsername(username)
    res.status(200).json({ status: true, data: user })

  } catch (error: unknown) {
    if (error instanceof Error) {
    console.error(error);
      res.status(500).json({ status: false, error: error.message });
    } else {
      res.status(500).json({ status: false, error: 'Unknown error' });
    }
  }
}

// update
export const updateById = async (req: Request, res: Response) => {

  // TODO auth headers? or just exist?
  if (!req.headers.authorization) {
    return res.status(401).json({ status: false, error: 'No token provided' });
  }

  let data = { ...req.body } as UpdateUser // clone to avoid mutation

  const password = data.password
  if (password) {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    data.hashedPassword = hashedPassword;
    delete data.password;
  }

  const userId: string | undefined = req.params.id
  if (!userId) {
    res.status(400).json({ status: false, error: 'no Id provided'})
    return
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

    const user = await userDAO.update(userId, data)
    res.status(200).json({ status: true, data: user })

  } catch (error: unknown) {
    if (error instanceof Error) {
      if (error.message === 'User does not exist') {
        res.status(404).json({ status: false, error: error.message });
      } else {
        console.error(error);
        res.status(500).json({ status: false, error: error.message });
      }
    } else {
      res.status(500).json({ status: false, error: 'Unknown error' });
    }
  }
}


// delete
export const deleteById = async (req: Request, res: Response) => {

  // TODO auth headers? or just exist?
  if (!req.headers.authorization) {
    return res.status(401).json({ status: false, error: 'No token provided' });
  }

  const userId = req.params.id
  if (!userId){
    return res.status(400).json({ status: false, error: 'User ID is required OR not found' })
  }

  try {
    const deleteUser = await userDAO.deleteById(userId)
    res.status(200).json({ status: true, message: `User ${deleteUser.username} deleted successfully` })
    
  } catch (error: unknown) {
    if (error instanceof Error) {
      if (error.message === 'User does not exist') {
        res.status(404).json({ status: false, error: error.message });
      } else {
        console.error(error);
        res.status(500).json({ status: false, error: error.message });
      }
    } else {
      res.status(500).json({ status: false, error: 'Unknown error' });
    }
  }
}