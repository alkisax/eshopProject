
import { useState } from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { account } from "./appwriteConfig";
import { ID } from "appwrite";

const RegisterPageAppwrite = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loadingStatus, setLoadingStatus] = useState(false);

  const navigate = useNavigate()

  const handleRegister = async (event: { preventDefault: () => void; }) => {
    setLoadingStatus(true)
    event.preventDefault();
    try {
      // Call Appwrite function to handle user registration
      if (password !== confirmPassword) {
        alert("Passwords do not match");
        setLoadingStatus(false)
        return;
      }
      if (
        username === "" ||
        email === "" ||
        password === "" ||
        confirmPassword === ""
      ) {
        alert("Please fill in all fields");
        setLoadingStatus(false);
        return;
      }

      // appwrite Register functionality 👇
      if (password.length < 8) {
        alert("Password must contain 8 characters");
        setLoadingStatus(false);
        return;
      }

      const promise = account.create(ID.unique(), email, password, username);

      promise.then(
        function (response) {
          console.log(response); // Success
          alert("Account Created Successfully 🚀");
          navigate("/appwrite-login");
        },
        function (error) {
          console.log(error); // Failure
          alert(error);
        }
      );
    } catch (err) {
      if (err instanceof Error) {
        alert(err.message);
      } else {
        alert("An unknown error occurred.");
      }
    }
  };

  return (
    <div className="registerPage">
      <h2>Register</h2>
      <form onSubmit={handleRegister}>
        <div>
          <label htmlFor="username">Username:</label>
          <input
            type="text"
            required
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>

        <div>
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            required
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div>
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            required
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <div>
          <label htmlFor="confirmPassword">Confirm Password:</label>
          <input
            type="password"
            required
            id="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </div>
        <button type="submit">{<button type="submit">{loadingStatus ? "Loading..." : "Register"}</button>
}</button>

        <div>
          Have an account? <Link to="/appwrite-login">Login</Link>
        </div>
      </form>
    </div>
  );
};

export default RegisterPageAppwrite;