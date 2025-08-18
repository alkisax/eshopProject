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
          hasPassword: true,
          provider: "appwrite",
        };
      } catch {
        // No Appwrite session, check localStorage
        const token = localStorage.getItem("token");
        if (token) {
          try {
            decodedToken = jwtDecode<GoogleJwtPayload | BackendJwtPayload>(token);
            console.log("decoded token from context: ", decodedToken);
            
            provider = decodedToken.provider || "backend";
          } catch {
            localStorage.removeItem("token");
            provider = "none";
          }
        }
      }
      
      console.log("Current provider:", provider);
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
                hasPassword: true,
                provider: "appwrite",
              };
            } else {
              normalizedUser = {
                _id: appwriteUser.$id,
                username: appwriteUser.username || appwriteUser.email.split("@")[0],
                name: appwriteUser.name || "",
                email: appwriteUser.email,
                roles: ["USER"],
                hasPassword: true,
                provider: "appwrite",
              };
            }
            setUser(normalizedUser);
          } catch (err) {
            console.error("Backend sync failed:", err);
            setUser({
              _id: appwriteUser.$id,
              username: appwriteUser.username || appwriteUser.email.split("@")[0],
              name: appwriteUser.name || "",
              email: appwriteUser.email,
              roles: ["USER"],
              hasPassword: appwriteUser.hasPassword,
              provider: "appwrite",
            });
          }
          break;

        case "google": {
          const googleUser = decodedToken as GoogleJwtPayload;
          try {
            const response = await axios.get(
              `${import.meta.env.VITE_BACKEND_URL}/api/users/email/${googleUser.email}`,
              { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }}
            );
            const res = response.data.data
            console.log("Full response:", response);
            console.log("response after googlelogin test:", res);
            

            setUser({
              _id: res._id,
              username: res.username,
              name: res.name,
              email: res.email,
              roles: res.roles,
              hasPassword: !!res.hashedPassword,
              provider: "google",
            });
          } catch (error) {
            console.error("Failed to fetch user from backend:", error);
            // fallback if backend fetch fails
            setUser({
              _id: googleUser.id,
              username: googleUser.username || googleUser.email.split("@")[0],
              name: googleUser.name,
              email: googleUser.email,
              roles: googleUser.roles,
              hasPassword: false,
              provider: "google",
            });
          }
          break;
        }

        case "backend": {
          const backendUser = decodedToken as BackendJwtPayload;
          setUser({
            _id: backendUser.id,
            username: backendUser.username,
            name: backendUser.name,
            email: backendUser.email,
            roles: backendUser.roles,
            hasPassword: backendUser.hasPassword,
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