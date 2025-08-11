// https://github.com/mkarampatsis/coding-factory7-nodejs/blob/main/usersApp/controllers/auth.controller.js
// https://fullstackopen.com/en/part4/token_authentication

import jwt from 'jsonwebtoken';
import User from '../models/users.models';
import { account } from '../../utils/appwrite'
import { OAuthProvider } from 'appwrite';
import { authService } from '../services/auth.service';
import { userDAO } from '../dao/user.dao';
import type { Request, Response } from 'express';

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

// DRY problem
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
        return res.status(500).json({ status: false, error: error.message });
      } else {
        return res.status(500).json({ status: false, error: 'Unknown error' });
      }
    }
  }

  // 4. Generate your app’s JWT

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT secret is not defined in environment variables");
  }

  if (!dbUser) {
    return res.status(500).json({ status: false, error: "User not found or failed to create" });
  }

  const payload = { id: dbUser._id, roles: dbUser.roles };
  const token = jwt.sign(payload, secret, { expiresIn: '1d' });

  // 5. Redirect to front if sign in
  const frontendUrl = process.env.FRONTEND_URL
  return res.redirect(`${frontendUrl}/google-success?token=${token}&email=${dbUser.email}`);
}

export const githubLogin = async (req: Request, res: Response) => {
  
  const frontendUrl = process.env.FRONTEND_URL


  try {
    const session =  await account.createOAuth2Session(
      OAuthProvider.Github,
      `${frontendUrl}/github-success`,
      `${frontendUrl}/signup`
    )
    //When GitHub login is successful, Appwrite redirects to your github-success page.
    // At this point, the browser already has a session cookie, so you can call: const user = await account.get() If you’re doing this from the frontend, you can call it directly with the Appwrite Web SDK. If you want to do it from the backend, you’ll need to pass the Appwrite session cookie from the browser to your backend.
  } catch (error: unknown) {
    if (error instanceof Error) {
      return res.status(500).json({ status: false, error: error.message });
    } else {
      return res.status(500).json({ status: false, error: 'Unknown error' });
    }
  }
}

// Create a route in your backend (for example, /auth/github/callback) 
export const githubCallback = async (req: Request, res: Response) => {
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
  googleLogin,
  googleSignup,
  githubLogin,
  githubCallback
}