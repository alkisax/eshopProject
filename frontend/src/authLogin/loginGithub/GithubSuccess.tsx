import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import axios from "axios";

/*
  Github OAuth SUCCESS PAGE
  ΠΑΛΙΑ:
  - βασιζόμασταν σε Appwrite session
  - καλούσαμε refreshUser()
  - δεν υπήρχε ασφαλές token exchange
  ΤΩΡΑ:
  - το backend κάνει redirect με ?code=...
  - κάνουμε POST /api/auth/exchange-code
  - αποθηκεύουμε JWT στο localStorage
  - κάνουμε hard reload
  - το UserAuthContext.fetchUser() γεμίζει το user
*/

const GithubSuccess = () => {
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const exchange = async () => {
      const code = searchParams.get("code");

      if (!code) {
        console.warn("No exchange code found in GitHub success");
        return;
      }

      try {
        const res = await axios.post(
          `${import.meta.env.VITE_BACKEND_URL}/api/auth/exchange-code`,
          { code }
        );

        const token = res.data.data.token;

        // αποθηκεύουμε το token
        localStorage.setItem("token", token);

        // ΔΕΝ κάνουμε setUser εδώ
        // το UserAuthContext.fetchUser() θα τρέξει στο reload
        window.location.href = "/";
      } catch (err) {
        console.error("GitHub exchange code failed", err);
      }
    };

    exchange();
  }, [searchParams]);

  return <p>GitHub login successful. Redirecting…</p>;
};

export default GithubSuccess;

/*
 ΠΑΛΙΑ ΛΟΓΙΚΗ (ΚΡΑΤΗΜΕΝΗ ΓΙΑ REFERENCE)

import { useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { UserAuthContext } from "../../context/UserAuthContext";
const GithubSuccess = () => {
  const navigate = useNavigate();
  const { refreshUser } = useContext(UserAuthContext);
  useEffect(() => {
    if (window.location.hash === "#") {
      refreshUser?.();
      navigate("/");
    }
  }, [refreshUser, navigate]);
  return <p>Github login succesfull.</p>;
};

*/
