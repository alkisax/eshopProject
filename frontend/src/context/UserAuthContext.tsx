import { createContext, useEffect, useState  } from "react";
import { jwtDecode } from "jwt-decode";
import axios from 'axios';
import { account } from "../authLogin/appwriteConfig"; 
import type { AppwriteUser, GoogleJwtPayload, UserAuthContextType, UserProviderProps, BackendJwtPayload } from "../types/types";
import type { IUser } from "../types/types"

// Provide a default value for createContext
// eslint-disable-next-line react-refresh/only-export-components
export const UserAuthContext = createContext<UserAuthContextType>({
  user: null,
  setUser: () => {},
  isLoading: true,
  setIsLoading: () => {},
});

export const UserProvider = ({ children }: UserProviderProps) => {
  const [user, setUser] = useState<IUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log("User updated:", user);
  }, [user]);

  useEffect(() => {
    const fetchUser = async () => {
      let provider: "appwrite" | "google" | "backend" | "none" = "none";
      let decodedToken: GoogleJwtPayload | BackendJwtPayload | null = null;
      let appwriteUser: AppwriteUser | null = null;

      // 1️⃣ Check Appwrite session
      try {
        const sessionUser = await account.get();
        provider = "appwrite";
        appwriteUser = {
          $id: sessionUser.$id,
          email: sessionUser.email,
          name: sessionUser.name || "",
          provider: "appwrite",
        };
      } catch {
        // No Appwrite session, check localStorage
        const token = localStorage.getItem("token");
        if (token) {
          try {
            decodedToken = jwtDecode<GoogleJwtPayload | BackendJwtPayload>(token);
            provider = decodedToken.provider || "backend";
          } catch {
            localStorage.removeItem("token");
            provider = "none";
          }
        }
      }

      // 2️⃣ Switch on provider
      switch (provider) {
        case "appwrite":
          if (!appwriteUser) {
            console.error("No Appwrite user found");
            return;
          }
          try {
            // 🔄 Sync roles from backend
            const syncRes = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/auth/appwrite/sync`, {
              email: appwriteUser.email,
            });

            let normalizedUser: IUser;

            if (syncRes.data.status) {
              const { user: dbUser, token } = syncRes.data.data;
              localStorage.setItem("token", token);
              normalizedUser = {
                _id: dbUser._id,
                username: dbUser.username,
                name: dbUser.name,
                email: dbUser.email,
                roles: dbUser.roles,
                provider: "appwrite",
              };
            } else {
              normalizedUser = {
                _id: appwriteUser.$id,
                username: appwriteUser.name || appwriteUser.email.split("@")[0],
                name: appwriteUser.name || "",
                email: appwriteUser.email,
                roles: ["USER"],
                provider: "appwrite",
              };
            }
            setUser(normalizedUser);
          } catch (err) {
            console.error("Backend sync failed:", err);
            setUser({
              _id: appwriteUser.$id,
              username: appwriteUser.name || appwriteUser.email.split("@")[0],
              name: appwriteUser.name || "",
              email: appwriteUser.email,
              roles: ["USER"],
              provider: "appwrite",
            });
          }
          break;

        case "google": {
          const googleUser = decodedToken as GoogleJwtPayload;
          setUser({
            _id: googleUser.id,
            username: googleUser.name || googleUser.email.split("@")[0],
            name: googleUser.name,
            email: googleUser.email,
            roles: googleUser.roles,
            provider: "google",
          });
          break;
        }

        case "backend": {
          const backendUser = decodedToken as BackendJwtPayload;
          setUser({
            _id: backendUser.id,
            username: backendUser.username,
            name: backendUser.username,
            email: backendUser.email,
            roles: backendUser.roles,
            provider: "backend",
          });
          break;
        }

        default:
          setUser(null);
          break;
      }

      setIsLoading(false);
    };

    fetchUser();
  }, []);


  return (
    <UserAuthContext.Provider value={{ user, setUser, isLoading, setIsLoading }}>
      {children}
    </UserAuthContext.Provider>
  );
};