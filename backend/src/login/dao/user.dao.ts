import type { IUser, UserView, CreateUserHash, UpdateUser } from '../types/user.types';
import User from '../models/users.models';

// Response DAO (safe to send to client no hashed pass)
export const toUserDAO = (user: IUser): UserView => {
  return {
    id: user._id.toString(),
    username: user.username,
    name: user.name,
    email: user.email,
    roles: user.roles,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt
  };
};

const create = async (userData: CreateUserHash): Promise<UserView> => {
  const user = new User({
    username: userData.username,
    name: userData.name,
    email: userData.email,
    roles: userData.roles ?? ['user'],
    hashedPassword: userData.hashedPassword
  });

  const response = await user.save();
  if (!response) {
    throw new Error('error saving user');
  }
  return toUserDAO(response as IUser); 
};

const readAll = async (): Promise<UserView[]> => {
  const response = await User.find();
  if (response.length === 0) {
    throw new Error('No users found');
  }
  return response.map((user) => toUserDAO(user as IUser));
};

const readById = async (userId: string): Promise<UserView> => {
  const user = await User.findById(userId);
  if (!user) {throw new Error('User not found');}
  return toUserDAO(user as IUser);
};

const readByUsername = async (username: string): Promise<UserView> => {
  const user = await User.findOne({ username: username });
  if (!user) {throw new Error(`User with username ${username} not found`);}
  return toUserDAO(user as IUser);
};

const toServerById = async (userId: string): Promise<IUser> => {
  const user = await User.findById(userId);
  if (!user) {throw new Error('User not found');}
  return user as IUser;
};

const toServerByEmail = async (email: string): Promise<IUser | null> => {
  const user = await User.findOne({ email: email });
  return user ? user as IUser : null;
};

const toServerbyUsername = async (username: string): Promise<IUser | null> => {
  const user = await User.findOne({ username: username });
  // if (!user) throw new Error(`User with username ${username} not found`);
  return user ? (user as IUser) : null;
};

const update = async (userId: string, userData: UpdateUser): Promise<UserView> => {
  const response = await User.findByIdAndUpdate(userId, userData, { new: true });
  if (!response) {
    throw new Error('User does not exist');
  }
  return toUserDAO(response as IUser);
};

const deleteById = async (userId: string): Promise<UserView> => {
  const response = await User.findByIdAndDelete(userId);
  if (!response) {
    const error = new Error('User does not exist') as Error & { status?: number };
    error.status = 404;
    throw error;
  }
  return toUserDAO(response as IUser);
};

export const userDAO = {
  toUserDAO,
  create,
  readAll,
  readById,
  readByUsername,
  toServerById,
  toServerByEmail,
  toServerbyUsername,
  update,
  deleteById
};