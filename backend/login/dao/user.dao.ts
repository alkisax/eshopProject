import type { IUser, UserView, CreateUserHash, UpdateUser } from "../types/user.types.js"
import User from '../models/users.models.js'

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
    roles: userData.roles ?? ["user"],
    hashedPassword: userData.hashedPassword
  });

  const response = await user.save();
  if (!response) {
    throw new Error('error saving user');
  }
  return toUserDAO(response as IUser); 
}

const readAll = async (): Promise<UserView[]> => {
  const response = await User.find()
  if (response.length === 0) {
    throw new Error('No users found');
  }
  return response.map((user) => toUserDAO(user as IUser))
}

const readById = async (userId: string): Promise<UserView> => {
  const user = await User.findById(userId);
  if (!user) throw new Error('User not found');
  return toUserDAO(user as IUser);
};

const update = async (userId: string, userData: UpdateUser): Promise<UserView> => {
  const response = await User.findByIdAndUpdate(userId, userData, { new: true})
  if (!response) {
    throw new Error('User does not exist');
  }
  return toUserDAO(response as IUser)
}

const deleteById = async (userId: string): Promise<UserView> => {
  const response = await User.findByIdAndDelete(userId)
  if (!response) {
    throw new Error('User does not exist');
  }
  return toUserDAO(response as IUser)
}

export const userDAO = {
  toUserDAO,
  create,
  readAll,
  update,
  readById,
  deleteById
};