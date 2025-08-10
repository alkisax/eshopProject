// https://github.com/mkarampatsis/coding-factory7-nodejs/blob/main/usersApp/controllers/auth.controller.js
// https://fullstackopen.com/en/part4/token_authentication

import jwt from 'jsonwebtoken';
import User from '../models/users.models';
import { authService } from '../services/auth.service';
import { userDAO } from '../dao/user.dao';
import type { Request, Response } from 'express';
import type { CreateUser, UpdateUser } from '../types/user.types'
import { strict } from 'assert';

export const login = async (req: Request, res: Response) => {
  try {

    const username = req.body.username
    const password = req.body.password

    if (!username) {
      console.log("Login attempt missing username");
      return res.status(400).json({ status: false, data: "Username is required"
      });
    }
    
    if (!password) {
      console.log("Login attempt missing password");
      return res.status(400).json({ status: false, data: "Password is required"
      });
    }

    // Step 1: Find the user by username
    const user = await userDAO.toServerbyUsername(req.body.username);

    if(!user){
      console.log(`Failed login attempt with username: ${req.body.username}`);
      return res.status(401).json({ status: false, data: 'Invalid username or password' })
    }

    // Step 2: Check the password
    const isMatch = await authService.verifyPassword (password, user.hashedPassword)

    if(!isMatch){
      console.log(`Failed login attempt with username: ${req.body.username}`);
      return res.status(401).json({ status: false, message: 'Invalid username or password' })
    }

    // Step 3: Generate the token
    const token = authService.generateAccessToken(user)
    console.log(`User ${user.username} logged in successfully`);

    // Step 4: Return the token and user info
    res.status(200).json({ status: true, data: {
        token: token,
        user: {
          username: user.username,
          email: user.email,
          roles: user.roles,
          id: user._id
        }
      }
    })

  } catch (error: unknown) {
    if (error instanceof Error) {
    console.error(error);
      res.status(500).json({ status: false, error: error.message });
    } else {
      res.status(500).json({ status: false, error: 'Unknown error' });
    }
  }
}

export const googleLogin = async(req: Request, res: Response) => {
  // 1. Controller receives the Google code from Google
  const code = req.query.code

  if (typeof code !== 'string') {
    console.log('Auth code is missing during Google login attempt');
    return res.status(400).json({ status: false, data: 'auth code is missing' });
  }

  // 2 – Authenticate with Google calls service which:
    // a. Uses Google’s OAuth2 client to exchange the code for tokens (access_token, id_token, etc.).
    // b. Verifies the id_token to ensure it’s really from Google.
    // c. Extracts user profile info (email, name, etc.) from Google’s payload.

  const { user, tokens, error } = await authService.googleAuth(code);

  if (error || !user || !user.email) {
    console.log('Google login failed or incomplete');
    return res.status(401).json({ status: false, data: "Google login failed" });
  }

  // 3 - If user does not exist → redirect to frontend signup

  // Check if user exists
  const dbUser = await User.findOne({ email: user.email });

  if (!dbUser) {
    const frontendUrl = process.env.FRONTEND_URL;
    // Redirect to signup page 
    return res.redirect(`${frontendUrl}/signup`);
  }

  // const dbUser = await User.findOneAndUpdate(
  //   { email: user.email },
  //   { $setOnInsert: { email: user.email, name: user.name, roles: ['user'] } },
  //   { upsert: true, new: true }
  // );

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT secret is not defined in environment variables");
  }

  // 4. Generate your app’s JWT
  const payload = { id: dbUser._id, roles: dbUser.roles };
  const token = jwt.sign(payload, secret, { expiresIn: '1d' });

  // 5. Redirect to front if sign in
  const frontendUrl = process.env.FRONTEND_URL
  return res.redirect(`${frontendUrl}/google-success?token=${token}&email=${dbUser.email}`);
}

export const googleSignup  = async(req: Request, res: Response) => {
  // 1. Controller receives the Google code from Google
  const code = req.query.code

  if (typeof code !== 'string') {
    console.log('Auth code is missing during Google login attempt');
    return res.status(400).json({ status: false, data: 'auth code is missing' });
  }

  // 2 – Authenticate with Google calls service which:
  const { user, tokens, error } = await authService.googleAuth(code);

  if (error || !user || !user.email) {
    console.log('Google login failed or incomplete');
    return res.status(401).json({ status: false, data: "Google login failed" });
  }

  // 3 - If user exists signs them in else create user
  // Check if user exists
  let  dbUser = await User.findOne({ email: user.email });

  if (!dbUser) {
    try {
      dbUser = await User.findOneAndUpdate(
        { email: user.email },
        { $setOnInsert: { email: user.email, name: user.name, roles: ['user'] } },
        { upsert: true, new: true }
      )
    } catch (error: unknown) {
      if (error instanceof Error) {
      console.error(error);
        res.status(500).json({ status: false, error: error.message });
      } else {
        res.status(500).json({ status: false, error: 'Unknown error' });
      }
    }
  }

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT secret is not defined in environment variables");
  }

  // 4. Generate your app’s JWT

  if (!dbUser) {
    return res.status(500).json({ status: false, error: "User not found or failed to create" });
  }

  const payload = { id: dbUser._id, roles: dbUser.roles };
  const token = jwt.sign(payload, secret, { expiresIn: '1d' });

  // 5. Redirect to front if sign in
  const frontendUrl = process.env.FRONTEND_URL
  return res.redirect(`${frontendUrl}/google-success?token=${token}&email=${dbUser.email}`);
}

