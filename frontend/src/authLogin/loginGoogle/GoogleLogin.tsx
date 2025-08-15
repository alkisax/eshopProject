import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Box, Button, Typography } from "@mui/material";
import GoogleIcon from "@mui/icons-material/Google";
import axios from 'axios';

interface Params {
  url: string
}

const GoogleLoginTest = ({ url }: Params) => {
  const [searchParams] = useSearchParams();

  const [googleUrl, setGoogleUrl] = useState<string | null>(null); //login
  const [signupUrl, setSignupUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const message = searchParams.get('message');

  useEffect(() => {
    const fetchUrls = async () => {
      try {
        const response = await axios.get(`${url}/api/auth/google/url/login`); // adjust path if needed
        const signupResponse = await axios.get(`${url}/api/auth/google/url/signup`);
        setGoogleUrl(response.data.url);
        setSignupUrl(signupResponse.data.url);
      } catch (err) {
        setError('Failed to fetch Google login URL');
        console.error(err);
      }
    };

    fetchUrls();
  }, [url]);

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!googleUrl || !signupUrl) {
    return <div>Loading Google URLs...</div>;
  }

  return (
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
      {message && (
        <Typography variant="body1" color="error">
          {message}
        </Typography>
      )}

      <Box sx={{ display: "flex", gap: 1 }}>
        <Button
          component="a"
          href={googleUrl}
          variant="contained"
          color="primary"
          startIcon={<GoogleIcon />}
          fullWidth
        >
          Login with Google
        </Button>

        <Button
          component="a"
          href={signupUrl}
          variant="outlined"
          color="primary"
          startIcon={<GoogleIcon />}
          fullWidth
        >
          Signup with Google
        </Button>       
      </Box>


      {/* {googleUrl ? <p>{googleUrl}</p> : <p>loading...</p>} */}
    </Box>
  );
};

export default GoogleLoginTest;
