// googleAuthService.ts
import axios from "axios";

export async function checkGoogleSession(url: string) {
  const token = localStorage.getItem("google_token");
  if (!token) return null;

  try {
    const res = await axios.get(
      `${url}/api/auth/google/callback`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    // Expected res.data = { status: true, token, user: { id, name, email, role, createdAt } }
    if (res.data.status) {
      return res.data.user;
    } else {
      console.log("no data response (checkGoogleSession)");
      return null      
    }
  } catch (err) {
    console.error("Google session check failed:", err);
    return null;
  }
}