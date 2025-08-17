import { useState } from "react";
import { Box, Tab, Tabs, Typography, Paper, Divider } from "@mui/material";
import LoginBackend from "./loginBackend/LoginBackend";
import LoginAppwriteLogin from "./loginAppwrite/LoginAppwrite";
import GoogleLogin from "./loginGoogle/GoogleLogin";
import GithubLogin from "./loginGithub/LoginGithub";

interface Params {
  url: string;
}

const Login = ({ url }: Params) => {
  const [tab, setTab] = useState(0);

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTab(newValue);
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#f5f5f5",
        p: 2,
      }}
    >
      <Paper
        elevation={6}
        sx={{
          width: 400,
          p: 3,
          display: "flex",
          flexDirection: "column",
          gap: 0,
          textAlign: "center",
        }}
      >
        <Typography variant="h5" sx={{ mb: 2 }}>
          Login
        </Typography>

        {/* Tabs */}
        <Tabs value={tab} onChange={handleTabChange} centered>
          <Tab label="Login" />
          <Tab label="Appwrite alt" />
        </Tabs>

        <Divider />

        {/* Conditional rendering of login forms */}
        {tab === 0 && <LoginBackend url={url} />}
        {tab === 1 && <LoginAppwriteLogin url={url} />}

        <Divider sx={{ my: 0 }} />

        <Box sx={{ maxWidth: 400, margin: "auto", display: "flex", flexDirection: "column", gap: 0 }}>
          <Box sx={{ display: "flex", gap: 0 }}>
            <Box sx={{ flex: 1 }}>
              <GoogleLogin url={url} /> 
            </Box>
          </Box>
          <Box sx={{ width: "100%" }}>
            <GithubLogin />
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default Login;



// import GoogleLogin from "./loginGoogle/GoogleLogin"
// import LoginAppwriteLogin from "./loginAppwrite/LoginAppwrite"
// import LoginBackend from "./loginBackend/LoginBackend"
// import GithubLogin from "./loginGithub/LoginGithub";

// interface params {
//   url: string
// }

// const Login = ({ url }: params) => {

//   return (
//     <>
//       <LoginBackend url={url} />
//       <LoginAppwriteLogin url={url} />
//       <GoogleLogin url={url} />
//       <GithubLogin />
//     </>
//   )
// }

// export default Login