import { account } from "./loginAppwrite/appwriteConfig";
import type { AppwriteUser } from "../types/types"

type SetUser = (user: AppwriteUser | null) => void;

export const handleLogout = async (
  setUser: SetUser,
  navigate: (path: string) => void
) => {
  try {
    // Remove Google/Appwrite tokens
    localStorage.removeItem("token");
    sessionStorage.removeItem("token");

    // Try to delete Appwrite session
    try {
      await account.deleteSession("current");
    } catch (error) {
      console.log("No Appwrite session", error);
    }

    // Clear React state
    setUser(null);

    // Redirect
    navigate("/");
  } catch (error) {
    console.error("Error during universal logout:", error);
  }
};

