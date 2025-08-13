import { createContext, useEffect, useState  } from "react";
import type { ReactNode   } from "react"
import { account } from "./appwriteConfig";

interface AppwriteUser {
  $id: string;
  email: string;
  name?: string;
}

interface UserAuthContextType {
  user: AppwriteUser | null;
  setUser: (user: AppwriteUser | null) => void;
  isLoading: boolean;
}

// Props type for the provider
interface UserProviderProps {
  children: ReactNode;
}


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
    const fetchUser = async () => {
      try {
        const sessionUser = await account.get();
        setUser({
          $id: sessionUser.$id,
          email: sessionUser.email,
          name: sessionUser.name || "",
        });
      } catch {
        setUser(null); // no active session
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