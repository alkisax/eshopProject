// https://www.youtube.com/watch?v=Bx1JqfPROXA

import { account } from "../../lib/appwriteConfig";
import { OAuthProvider } from "appwrite";
import { Box, Button } from "@mui/material";
import GitHubIcon from "@mui/icons-material/GitHub";

const GithubLogin = () => {
  
  
  const handleGithubLogin = async () => {

    // Clear Appwrite session first
    await account.deleteSession("current").catch(() => {});

    account.createOAuth2Session(
      OAuthProvider.Github,
      `${import.meta.env.VITE_FRONTEND_URL}/github-success`, // your frontend page
      `${import.meta.env.VITE_FRONTEND_URL}/signup`, // failure page
    );
  };

  return (
    <>
      <Box
        sx={{
          maxWidth: 400,
          margin: "auto",
          display: "flex",
          flexDirection: "column",
          gap: 2,
          mt: 5,
          textAlign: "center",
        }}
      >


        <Button
          onClick={handleGithubLogin}
          variant="contained"
          color="primary"
          startIcon={<GitHubIcon />}
          fullWidth
        >
          Login with GitHub
        </Button>
      </Box>
    </>
  );
};

export default GithubLogin;


/*
το Link που μου έδεινε το appwrite ήταν 
https://fra.cloud.appwrite.io/v1/account/sessions/oauth2/callback/github/6898d8be0020602b146e
ολα οταν το έτρεχα μετατρεπόταν σε 
https://cloud.appwrite.io/v1/account/sessions/oauth2/callback/github/6898d8be0020602b146e
τελικα με αυτό το δευτερο στο gihub /Settings Developer settings eshopProject λειτούργησε
*/