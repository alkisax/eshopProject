import type { ReactNode } from "react"
import type { JwtPayload } from "jwt-decode";

export interface IUser {
  id?: string;
  _id?: string
  username: string
  name: string
  surname?: string
  email: string
  hashedPassword?: string
  password?: string
  hasPassword: boolean
  roles: string[]
  provider?: "appwrite" | "google" | "backend" | "github"
  favorites?: string[];
}

export interface AppwriteUser {
  $id: string;
  email: string;
  name?: string;
  username?: string
  roles?: string[];
  hasPassword: true
  provider?: "appwrite" | "google" | "backend" | "github";
  favorites?: string[];
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
  favorites?: string[];
}

export interface GithubJwtPayload extends JwtPayload {
  id: string;
  email: string;
  name: string;
  username?: string;
  roles: string[];
  hasPassword: boolean;
  provider?: "github";
}

export interface UserAuthContextType {
  user: IUser | null
  setUser: (user: IUser | null) => void
  isLoading: boolean
  setIsLoading: (loading: boolean) => void
  refreshUser?: () => Promise<void>;
}

// Props type for the provider
export interface UserProviderProps {
  children: ReactNode;
}

// for updating a user
export interface UpdateUser {
  username?: string
  name?: string;
  roles?: string[];
  password?: string; // optional, will be hashed if present
  hashedPassword?: string;
  favorites?: string[];
}