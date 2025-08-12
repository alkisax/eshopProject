import { useEffect, useState } from 'react';
import axios from 'axios';

interface Params {
  url: string
}

const GoogleLoginTest = ({ url }: Params) => {
  const [googleUrl, setGoogleUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGoogleUrl = async () => {
      try {
        const response = await axios.get(`${url}/api/auth/google/url`); // adjust path if needed
        setGoogleUrl(response.data.url);
      } catch (err) {
        setError('Failed to fetch Google login URL');
        console.error(err);
      }
    };

    fetchGoogleUrl();
  }, [url]);

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!googleUrl) {
    return <div>Loading Google login URL...</div>;
  }

  return (
    <div>
    <h2>Google Login Test</h2>
    <a href={googleUrl}>
      <button>Login with Google</button>
    </a>
    <a href={`${url}/api/auth/google/signup`}>
      <button>Signup with Google</button>
    </a>
      {googleUrl ? <p>{googleUrl}</p> : <p>loading...</p>}
    </div>
  );
};

export default GoogleLoginTest;
