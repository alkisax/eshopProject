import type { ReactNode } from "react"
import type { JwtPayload } from "jwt-decode";

export interface AppwriteUser {
  $id: string;
  email: string;
  name?: string;
  roles?: string[];
  provider?: "appwrite" | "google" | "backend";
}

export interface GoogleJwtPayload extends JwtPayload {
  id: string;
  email: string;
  name: string;
  roles: string[];
  provider?: "google"; 
}

export interface BackendJwtPayload extends JwtPayload {
  id: string;
  email: string;
  username: string;
  roles: string[];
  provider?: "backend";
}

export interface UserAuthContextType {
  user: AppwriteUser | null;
  setUser: (user: AppwriteUser | null) => void;
  isLoading: boolean;
}

// Props type for the provider
export interface UserProviderProps {
  children: ReactNode;
}