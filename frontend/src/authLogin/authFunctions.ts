import { account } from "./appwriteConfig";
import type { IUser } from "../types/types"

type SetUser = (user: IUser | null) => void;
type SetHasCart = (value: boolean) => void;

export const handleLogout = async (
  setUser: SetUser,
  setHasCart: SetHasCart,
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
    setHasCart(false)

    // Redirect
    navigate("/");
  } catch (error) {
    console.error("Error during universal logout:", error);
  }
};

