import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
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
    <>
      <div>
        {message && <p>{message}</p>}
      </div>
      <div>
        <h2>Google Login Test</h2>
        <a href={googleUrl}>
          <button>Login with Google</button>
        </a>
        <a href={signupUrl}>
          <button>Signup with Google</button>
        </a>
          {googleUrl ? <p>{googleUrl}</p> : <p>loading...</p>}
      </div>    
    </>

  );
};

export default GoogleLoginTest;
