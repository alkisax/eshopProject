/* eslint-disable no-console */
 
// https://github.com/mkarampatsis/coding-factory7-nodejs/blob/main/usersApp/controllers/auth.controller.js
// https://fullstackopen.com/en/part4/token_authentication

import jwt from 'jsonwebtoken';
import User from '../models/users.models';
import { account } from '../../utils/appwrite';
// import { OAuthProvider } from 'appwrite';
import querystring from 'querystring';
import { authService } from '../services/auth.service';
import { userDAO } from '../dao/user.dao';
import type { Request, Response } from 'express';
import { AuthRequest } from '../types/user.types';
import { handleControllerError } from '../services/errorHnadler';

export const login = async (req: Request, res: Response) => {
  try {

    const username = req.body.username;
    const password = req.body.password;

    if (!username) {
      console.log('Login attempt missing username');
      return res.status(400).json({ status: false, data: 'Username is required'
      });
    }
    
    if (!password) {
      console.log('Login attempt missing password');
      return res.status(400).json({ status: false, data: 'Password is required'
      });
    }

    // Step 1: Find the user by username
    const user = await userDAO.toServerbyUsername(req.body.username);

    if(!user){
      console.log(`Failed login attempt with username: ${req.body.username}`);
      return res.status(401).json({ status: false, data: 'Invalid username or password' });
    }

    // Step 2: Check the password
    const isMatch = await authService.verifyPassword (password, user.hashedPassword);

    if(!isMatch){
      console.log(`Failed login attempt with username: ${req.body.username}`);
      return res.status(401).json({ status: false, message: 'Invalid username or password' });
    }

    // Step 3: Generate the token
    const token = authService.generateAccessToken(user);
    console.log(`User ${user.username} logged in successfully`);

    // Step 4: Return the token and user info
    return res.status(200).json({ status: true, data: {
      token: token,
      user: {
        _id: user._id,
        id: user._id,
        username: user.username,
        name: user.name, 
        email: user.email,
        roles: user.roles,
        hasPassword: !!user.hashedPassword,
        provider: 'backend',
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      }
    }
    });

  } catch (error) {
    return handleControllerError(res, error);
  }
};

// αυτο είναι ένα endpoint που απλώς κατασκευάζει και επιστρέφει το url για το goole login ωστε να μην υπάρχει hardcoded στο front
export const getGoogleOAuthUrlLogin = (_req: Request, res: Response) => {
  const rootUrl = 'https://accounts.google.com/o/oauth2/auth';

  const options = {
    client_id: process.env.GOOGLE_CLIENT_ID,
    redirect_uri: process.env.GOOGLE_REDIRECT_URI_LOGIN,
    response_type: 'code',
    scope: ['email', 'profile'].join(' '),
    access_type: 'offline',
    prompt: 'consent'
  };

  const qs = querystring.stringify(options);
  const url = `${rootUrl}?${qs}`;

  return res.status(200).json({ url });
};

export const getGoogleOAuthUrlSignup = (_req: Request, res: Response) => {
  const rootUrl = 'https://accounts.google.com/o/oauth2/auth';

  const options = {
    client_id: process.env.GOOGLE_CLIENT_ID,
    redirect_uri: process.env.GOOGLE_REDIRECT_URI_SIGNUP,
    response_type: 'code',
    scope: ['email', 'profile'].join(' '),
    access_type: 'offline',
    prompt: 'consent'
  };

  const qs = querystring.stringify(options);
  const url = `${rootUrl}?${qs}`;

  return res.status(200).json({ url });
};

export const googleCallback = async (req: AuthRequest, res: Response) => {
  try{
    const googleUser = req.user;

    if (!googleUser?.email) {
      return res.status(404).json({ status: false, message: 'Cant find email in googleCallback' });
    }

    if (!process.env.JWT_SECRET) {
      return res.status(404).json({ status: false, message:'JWT_SECRET is not defined' });
    }

    const user = await userDAO.toServerByEmail(googleUser.email);

    if (!user) {
      return res.status(404).json({ status: false, message: 'User does not exist (googleCallback)' });
    }

    // Generate JWT
    const token = jwt.sign(
      {
        id: user._id,
        username: user.username,
        email: user.email,
        roles: user.roles,
        hasPassword: !!user.hashedPassword,
        provider: 'google',
      },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    // Send *all* user data to frontend
    return res.status(200).json({
      status: true,
      token,
      user: {
        _id: user._id,
        username: user.username,
        name: user.name,
        email: user.email,
        roles: user.roles,
        hasPassword: !!user.hashedPassword,
        provider: 'google',
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    return handleControllerError(res, error);
  }
};

export const googleLogin = async(req: Request, res: Response) => {
  const redirectUri = process.env.GOOGLE_REDIRECT_URI_LOGIN as string;
  // 1. Controller receives the Google code from Google
  const code = req.query.code;

  if (typeof code !== 'string') {
    console.log('Auth code is missing during Google login attempt');
    return res.status(400).json({ status: false, data: 'auth code is missing' });
  }

  const { user, error } = await authService.googleAuth(code, redirectUri);

  if (error || !user || !user.email) {
    console.log('Google login failed or incomplete');
    return res.status(401).json({ status: false, data: 'Google login failed' });
  }

  // 3 - If user does not exist → redirect to frontend signup

  // Check if user exists
  const dbUser = await User.findOne({ email: user.email });

  if (!dbUser) {
    const frontendUrl = process.env.FRONTEND_URL;
    // Redirect to signup page
    const message = `user ${user.email} doesn’t exist please sign up`;
    return res.redirect(`${frontendUrl}/login?message=${encodeURIComponent(message)}`);
  }

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT secret is not defined in environment variables');
  }

  // 4. Generate your app’s JWT
  const payload = { id: dbUser._id, name: dbUser.name, email: dbUser.email, roles: dbUser.roles, provider: 'google' };
  const token = jwt.sign(payload, secret, { expiresIn: '1d' });

  // 5. Redirect to front if sign in
  const frontendUrl = process.env.FRONTEND_URL;
  const message = `user ${dbUser.name} signed in`;
  return res.redirect(`${frontendUrl}/google-success?token=${token}&email=${dbUser.email}&message=${encodeURIComponent(message)}`);
};

// DRY problem
export const googleSignup  = async(req: Request, res: Response) => {
  const redirectUri = process.env.GOOGLE_REDIRECT_URI_SIGNUP as string;
  const frontendUrl = process.env.FRONTEND_URL;
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT secret is not defined in environment variables');
  }
  
  // 1. Controller receives the Google code from Google
  const code = req.query.code;

  if (typeof code !== 'string') {
    console.log('Auth code is missing during Google login attempt');
    return res.status(400).json({ status: false, data: 'auth code is missing' });
  }

  // 2 – Authenticate with Google calls service which:
  // a. Uses Google’s OAuth2 client to exchange the code for tokens (access_token, id_token, etc.).
  // b. Verifies the id_token to ensure it’s really from Google.
  // c. Extracts user profile info (email, name, etc.) from Google’s payload.
  const { user, error } = await authService.googleAuth(code, redirectUri);

  if (error || !user || !user.email) {
    console.log('Google login failed or incomplete');
    return res.status(401).json({ status: false, data: 'Google login failed' });
  }

  // 3 - If user exists signs them in else create user
  // Check if user exists
  let  dbUser = await User.findOne({ email: user.email });
  let message: string;

  if (!dbUser) {
    try {
      dbUser = await User.findOneAndUpdate(
        { email: user.email },
        { $setOnInsert: { email: user.email, name: user.name, roles: ['user'] } },
        { upsert: true, new: true }
      );
      message = `user ${user.email} created and signed in`;
    } catch (error: unknown) {
      if (error instanceof Error) {
        return res.status(500).json({ status: false, error: error.message });
      } else {
        return res.status(500).json({ status: false, error: 'Unknown error' });
      }
    }
  } else {
    message = `user ${dbUser.name} already exists. ${dbUser.name} is signed in`;
  }

  // 4. Generate your app’s JWT

  if (!dbUser) {
    return res.status(500).json({ status: false, error: 'User not found or failed to create' });
  }

  const payload = { id: dbUser._id, name: dbUser.name, email: dbUser.email, roles: dbUser.roles, provider: 'google' };
  const token = jwt.sign(payload, secret, { expiresIn: '1d' });

  // 5. Redirect to front if sign in
  return res.redirect(`${frontendUrl}/google-success?token=${token}&email=${dbUser.email}&message=${encodeURIComponent(message)}`);
};

// export const githubLogin = async (_req: Request, res: Response) => {
  
//   const frontendUrl = process.env.FRONTEND_URL

//   try {
//     await account.createOAuth2Session(
//       OAuthProvider.Github,
//       `${frontendUrl}/github-success`,
//       `${frontendUrl}/signup`
//     )
//     return res.status(200).json({ status: true, message: 'githublogin' })
//     //When GitHub login is successful, Appwrite redirects to your github-success page.
//     // At this point, the browser already has a session cookie, so you can call: const user = await account.get() If you’re doing this from the frontend, you can call it directly with the Appwrite Web SDK. If you want to do it from the backend, you’ll need to pass the Appwrite session cookie from the browser to your backend.
//   } catch (error: unknown) {
//     if (error instanceof Error) {
//       return res.status(500).json({ status: false, error: error.message });
//     } else {
//       return res.status(500).json({ status: false, error: 'Unknown error' });
//     }
//   }
// }

// Create a route in your backend (for example, /auth/github/callback) 
export const githubCallback = async (_req: Request, res: Response) => {
  try {
    // IMPORTANT: The browser must send Appwrite session cookie here,
    const appwriteUser = await account.get();  // gets logged-in user from Appwrite session

    if (!appwriteUser || !appwriteUser.email) {
      return res.redirect(`${process.env.FRONTEND_URL}/signup`);
    }

    // Check if user exists in your DB
    const dbUser = await User.findOne({ email: appwriteUser.email });

    if (!dbUser) {
      // Redirect to frontend signup page if user not found in your DB
      return res.redirect(`${process.env.FRONTEND_URL}/signup`);
    }

    // Generate your JWT for your app
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT secret is missing');
    }

    const token = jwt.sign(
      { id: dbUser._id, roles: dbUser.roles },
      secret,
      { expiresIn: '1d' }
    );

    // Redirect frontend with token & email
    res.redirect(
      `${process.env.FRONTEND_URL}/github-success?token=${token}&email=${dbUser.email}`
    );
  } catch (error) {
    console.error('GitHub OAuth callback error:', error);
    res.status(500).json({ status: false, error: 'GitHub OAuth callback failed' });
  }
};

export const authController = {
  login,
  getGoogleOAuthUrlLogin,
  getGoogleOAuthUrlSignup,
  googleLogin,
  googleSignup,
  // githubLogin,
  githubCallback
};