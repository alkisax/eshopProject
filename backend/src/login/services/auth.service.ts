import jwt from 'jsonwebtoken'
import type { JwtPayload } from 'jsonwebtoken'
import type { SignOptions } from "jsonwebtoken";
import bcrypt from 'bcrypt'
import { OAuth2Client } from 'google-auth-library'
import type { Request } from 'express';
import type { IUser } from "../types/user.types"

import { userDAO } from '../dao/user.dao';

const generateAccessToken = (user: IUser): string => {
  const payload = {
    id: user._id,
    username: user.username,
    email: user.email,
    roles: user.roles,
  }

  const secret = process.env.SECRET
 
  if (!secret) {
    throw new Error("JWT secret is not defined in environment variables");
  }

  const options: SignOptions = {
    expiresIn: '1h'
  }
  const token = jwt.sign(payload, secret, options)
  return token
}

const verifyPassword = async (password: string, hashedPassword: string): Promise<boolean> => {
  return await bcrypt.compare(password, hashedPassword)
}

type VerifyAccessTokenResult =
  | { verified: true; data: string | JwtPayload }
  | { verified: false; data: string };

const verifyAccessToken = (token: string): VerifyAccessTokenResult => {
  const secret = process.env.JWT_SECRET

  if (!secret) {
    throw new Error("JWT secret is not defined in environment variables");
  }
  
  try {
    const payload = jwt.verify(token, secret)
    return { 
      verified: true, data: payload
    }
  } catch (error: unknown) {
    if (error instanceof Error) {
      return { verified: false, data: error.message }   
    } else {
      return { verified: false, data: 'unknown error' }
    }
  }
}

const verifyAndFetchUser = async (token: string) => {
  const verification = verifyAccessToken(token)
  if (!verification.verified) {
    return { verified: false, reason: verification.data };
  }

  const payload = verification.data as { id: string }
  try {
    const user = await userDAO.readById(payload.id);
    return { verified: true, user };
  } catch {
    return { verified: false, reason: 'User not found' };
  }
}

const getTokenFrom = (req: Request): string | null => {
  const authorization = req.get('authorization')
  if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
    const token = authorization.replace('Bearer ', '')
    return token    
  }
  return null
}

const googleAuth = async (code: string, redirectUri: string) => {
  // google cloude -> conosole -> Api&Services -> credentials
  const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
  const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;

  if (!CLIENT_ID) {
    throw new Error("Google Client ID is missing from environment variables");
  }

  const oauth2Client = new OAuth2Client(CLIENT_ID, CLIENT_SECRET, redirectUri);

  try {
    // Exchange code for tokens
    const { tokens } = await oauth2Client.getToken(code)
    oauth2Client.setCredentials(tokens)

    if (!tokens.id_token) {
      throw new Error("ID token is missing from Google response");
    }

    const ticket = await oauth2Client.verifyIdToken({
      idToken: tokens.id_token,
      audience: CLIENT_ID
    });

    // console.log("Step 2")
    const userInfo = ticket.getPayload();
    // console.log("Google User", userInfo);
    return {user: userInfo, tokens}
  } catch (error) {
    console.log("Error in google authentication", error);
    return { error: "Failed to authenticate with google"}
  }
}

export const authService = {
  generateAccessToken,
  verifyPassword,
  verifyAccessToken,
  verifyAndFetchUser,
  getTokenFrom,
  googleAuth
}