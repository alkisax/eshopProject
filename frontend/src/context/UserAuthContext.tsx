import { createContext, useEffect, useState  } from "react";
import { jwtDecode } from "jwt-decode";
import axios from 'axios';
import { account } from "../authLogin/appwriteConfig"; 
import type { AppwriteUser, GoogleJwtPayload, UserAuthContextType, UserProviderProps, BackendJwtPayload } from "../types/types";

// Provide a default value for createContext
// eslint-disable-next-line react-refresh/only-export-components
export const UserAuthContext = createContext<UserAuthContextType>({
  user: null,
  setUser: () => {},
  isLoading: true,
});

export const UserProvider = ({ children }: UserProviderProps) => {
  const [user, setUser] = useState<AppwriteUser | null>(null);
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

            if (syncRes.data.status) {
              const { user: dbUser, token } = syncRes.data.data;
              localStorage.setItem("token", token);
              setUser(dbUser); // backend user has roles
            } else {
              setUser(appwriteUser); // fallback without roles
            }
          } catch (err) {
            console.error("Backend sync failed:", err);
            setUser(appwriteUser); // fallback
          }
          break;
        case "google": {
          const googleUser = decodedToken as GoogleJwtPayload;
          setUser({
            $id: googleUser.id,
            email: googleUser.email,
            name: googleUser.name,
            roles: googleUser.roles,
            provider: "google",
          });
          break;
        }

        case "backend": {
          const backendUser = decodedToken as BackendJwtPayload;
          setUser({
            $id: backendUser.id,
            email: backendUser.email,
            name: backendUser.username,
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


    // const fetchUser = async () => {
    //   try {
    //     // 1️⃣ Try Appwrite session first
    //     const sessionUser = await account.get();
    //     setUser({
    //       $id: sessionUser.$id,
    //       email: sessionUser.email,
    //       name: sessionUser.name || "",
    //       provider: "appwrite",
    //     });
    //   } catch {
    //     // 2️⃣ If no Appwrite session, try Google
    //     const token = localStorage.getItem("token");
    //     console.log("LocalStorage token on startup:", token);
    //     if (token) {
    //       try {
    //         const decoded = jwtDecode<GoogleJwtPayload>(token);
    //         console.log("Decoded Google token on startup:", decoded);
    //         setUser({
    //           $id: decoded.id,
    //           email: decoded.email,
    //           name: decoded.name,
    //           roles: decoded.roles,
    //           provider: "google",
    //         });
    //       } catch (err) {
    //         console.error("Invalid token", err);
    //         localStorage.removeItem("token");
    //       }
    //     }
    //   } finally {
    //     setIsLoading(false);
    //   }
    // };

  return (
    <UserAuthContext.Provider value={{ user, setUser, isLoading }}>
      {children}
    </UserAuthContext.Provider>
  );
};