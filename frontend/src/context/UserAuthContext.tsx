import { createContext, useEffect, useState  } from "react";
import { jwtDecode } from "jwt-decode";
import { account } from "../test_components/LoginAppwrite/appwriteConfig"; 
import type { AppwriteUser, GoogleJwtPayload, UserAuthContextType, UserProviderProps } from "../types/types";

// import { checkGoogleSession } from "../LoginGoogle/service/checkGoogleSession"; 

// interface AppwriteUser {
//   $id: string;
//   email: string;
//   name?: string;
//   provider?: "appwrite" | "google";
// }

// interface GoogleJwtPayload extends JwtPayload {
//   id: string;
//   email: string;
//   name: string;
//   roles: string[];
// }

// interface UserAuthContextType {
//   user: AppwriteUser | null;
//   setUser: (user: AppwriteUser | null) => void;
//   isLoading: boolean;
// }

// // Props type for the provider
// interface UserProviderProps {
//   children: ReactNode;
// }


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

    // const url: string = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001'

  useEffect(() => {
    const fetchUser = async () => {
      try {
        // 1️⃣ Try Appwrite session first
        const sessionUser = await account.get();
        setUser({
          $id: sessionUser.$id,
          email: sessionUser.email,
          name: sessionUser.name || "",
          provider: "appwrite",
        });
      } catch {
        // 2️⃣ If no Appwrite session, try Google
        const token = localStorage.getItem("token");
        console.log("LocalStorage token on startup:", token);
        if (token) {
          try {
            const decoded = jwtDecode<GoogleJwtPayload>(token);
            console.log("Decoded Google token on startup:", decoded);
            setUser({
              $id: decoded.id,
              email: decoded.email,
              name: decoded.name,
              provider: "google",
            });
          } catch (err) {
            console.error("Invalid token", err);
            localStorage.removeItem("token");
          }
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, []);

  return (
    <UserAuthContext.Provider value={{ user, setUser, isLoading }}>
      {children}
    </UserAuthContext.Provider>
  );
};