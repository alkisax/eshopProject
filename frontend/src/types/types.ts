import type { ReactNode } from "react"
import type { JwtPayload } from "jwt-decode";

export interface AppwriteUser {
  $id: string;
  email: string;
  name?: string;
  username?: string
  roles?: string[];
  hasPassword: true
  provider?: "appwrite" | "google" | "backend";
}

export interface GoogleJwtPayload extends JwtPayload {
  id: string;
  email: string;
  name: string;
  username?: string
  roles: string[];
  hasPassword: boolean
  provider?: "google"; 
}

export interface BackendJwtPayload extends JwtPayload {
  id: string;
  email: string;
  name: string
  username: string;
  roles: string[];
  hasPassword: boolean
  provider?: "backend";
}

export interface UserAuthContextType {
  user: IUser | null
  setUser: (user: IUser | null) => void
  isLoading: boolean
  setIsLoading: (loading: boolean) => void
}

// Props type for the provider
export interface UserProviderProps {
  children: ReactNode;
}

export interface IUser {
  _id?: string
  username: string
  name: string
  email: string
  hashedPassword?: string
  password?: string
  hasPassword: boolean
  roles: string[]
  provider?: "appwrite" | "google" | "backend"
}

// for updating a user
export interface UpdateUser {
  username?: string
  name?: string;
  roles?: string[];
  password?: string; // optional, will be hashed if present
  hashedPassword?: string;
}