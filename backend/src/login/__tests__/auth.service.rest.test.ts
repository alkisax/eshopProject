import jwt from 'jsonwebtoken';
// import bcrypt from 'bcrypt';
import { Types } from 'mongoose';
import { OAuth2Client } from 'google-auth-library';
import { authService } from '../services/auth.service';
import { userDAO } from '../dao/user.dao';
import type { IUser } from '../types/user.types';

jest.mock('jsonwebtoken');
jest.mock('bcrypt');
jest.mock('google-auth-library');
jest.mock('../dao/user.dao');

const mockUserId = new Types.ObjectId();

// helper: minimal mock user that still matches IUser
const makeMockUser = (overrides: Partial<IUser> = {}): IUser => {
  return {
    _id: mockUserId,
    username: 'u',
    name: 'n',
    email: 'e',
    roles: [],
    hashedPassword: '',
    ...overrides,
  } as unknown as IUser;
};

describe('authService unit tests', () => {
  afterEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
    delete process.env.JWT_SECRET;
    delete process.env.GOOGLE_CLIENT_ID;
    delete process.env.GOOGLE_CLIENT_SECRET;
  });

  describe('generateAccessToken', () => {
    it('should throw if JWT_SECRET missing', () => {
      delete process.env.JWT_SECRET;
      expect(() =>
        authService.generateAccessToken(makeMockUser())
      ).toThrow(/JWT secret is not defined/);
    });

    it('should return a token when secret is set', () => {
      process.env.JWT_SECRET = 'testsecret';
      (jwt.sign as jest.Mock).mockReturnValue('fake.token');
      const token = authService.generateAccessToken(makeMockUser());
      expect(token).toBe('fake.token');
    });
  });

  describe('verifyAccessToken', () => {
    it('should throw if JWT_SECRET missing', () => {
      expect(() => authService.verifyAccessToken('token')).toThrow(/JWT secret is not defined/);
    });

    it('should return verified true with valid token', () => {
      process.env.JWT_SECRET = 'testsecret';
      (jwt.verify as jest.Mock).mockReturnValue({ id: mockUserId });
      const res = authService.verifyAccessToken('token');
      expect(res.verified).toBe(true);
    });

    it('should return verified false with unknown error object', () => {
      process.env.JWT_SECRET = 'testsecret';
      (jwt.verify as jest.Mock).mockImplementation(() => {
        throw 'weird string error';
      });
      const res = authService.verifyAccessToken('token');
      expect(res).toEqual({ verified: false, data: 'unknown error' });
    });
  });

  describe('verifyAndFetchUser', () => {
    it('should return verified false with unknown error if token invalid', async () => {
      process.env.JWT_SECRET = 'testsecret';
      jest.spyOn(authService, 'verifyAccessToken').mockReturnValueOnce({ verified: false, data: 'bad token' });
      const res = await authService.verifyAndFetchUser('fake');
      expect(res).toEqual({ verified: false, reason: 'unknown error' });
    });

    it('should return verified false with unknown error if DAO fails', async () => {
      process.env.JWT_SECRET = 'testsecret';
      jest.spyOn(authService, 'verifyAccessToken').mockReturnValueOnce({ verified: true, data: { id: mockUserId } });
      (userDAO.readById as jest.Mock).mockRejectedValueOnce(new Error('not found'));
      const res = await authService.verifyAndFetchUser('token');
      expect(res).toEqual({ verified: false, reason: 'unknown error' });
    });
  });


  describe('googleAuth', () => {
    it('should throw if GOOGLE_CLIENT_ID missing', async () => {
      await expect(authService.googleAuth('code', 'redirect')).rejects.toThrow(/Google Client ID is missing/);
    });

    it('should return error if google getToken fails', async () => {
      process.env.GOOGLE_CLIENT_ID = 'cid';
      process.env.GOOGLE_CLIENT_SECRET = 'secret';
      const mockClient = {
        getToken: jest.fn().mockRejectedValue(new Error('fail')),
      };
      (OAuth2Client as unknown as jest.Mock).mockImplementation(() => mockClient);

      const res = await authService.googleAuth('code', 'redirect');
      expect(res).toEqual({ error: 'Failed to authenticate with google' });
    });

    it('should succeed and return user & tokens', async () => {
      process.env.GOOGLE_CLIENT_ID = 'cid';
      process.env.GOOGLE_CLIENT_SECRET = 'secret';

      const fakeTokens = { id_token: 'idtoken' };
      const fakePayload = { email: 'user@example.com', name: 'User' };

      const mockClient = {
        getToken: jest.fn().mockResolvedValue({ tokens: fakeTokens }),
        setCredentials: jest.fn(),
        verifyIdToken: jest.fn().mockResolvedValue({
          getPayload: () => fakePayload,
        }),
      };
      (OAuth2Client as unknown as jest.Mock).mockImplementation(() => mockClient);

      const res = await authService.googleAuth('code', 'redirect');
      expect(res.user).toEqual(fakePayload);
      expect(res.tokens).toEqual(fakeTokens);
    });
  });
});
