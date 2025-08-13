import { useState, useContext, useEffect  } from "react";
import { Link, useNavigate  } from "react-router-dom";
import { account } from "../appwriteConfig";
import { UserAuthContext } from "../UserAuthContext";

interface params {
  url: string
}

const GithubLoginTest = ({ url }: params) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [buttonLoading, setButtonLoading] = useState(false);

  // const endpoint: string = import.meta.env.VITE_APPWRITE_ENDPOINT
  // const projectId: string = import.meta.env.VITE_APPWRITE_PROJECT_ID
  console.log(url);

  const navigate = useNavigate()
  const { setUser, user  } = useContext(UserAuthContext);

  useEffect(() => {
    if(user !== null){
       navigate("/");
    }
  }, [user, navigate])
  
  const handleLogin = async (event: { preventDefault: () => void; }) => {
    setButtonLoading(true)
    event.preventDefault();
    if (password === "" || email === "") {
      alert("Please fill in the field required")
      setButtonLoading(false)
      return
    }

    // appwrite Login functionality 👇

    // Delete current session if any
    await account.deleteSession("current").catch(() => {});

    // Call Appwrite function to handle login with email and password
    const promise = account.createEmailPasswordSession(email, password);

    promise.then(
      function (response) {
        console.log(response); // Success
        setUser({
          $id: response.userId, // Session has userId
          email: email,         // We already have email from input
          name: "",             // optional, empty for now
        });
        navigate("/")
        setButtonLoading(false)
      },
      function (error) {
        console.log(error); // Failure
        setButtonLoading(false);
      }
    );
  }

  return (
    <>
      <div className="loginPage">
        <h2>Login</h2>
        <form onSubmit={handleLogin}>
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
          <button type="submit">{buttonLoading ? "Loading..." : "Login"}</button>

          <div>
            Dont have an account? <Link to="/register">Register</Link>
          </div>
        </form>
      </div>
    </>
  )
}

export default GithubLoginTest