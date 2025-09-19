import { useContext } from "react";
import { ConsentContext } from "./context/ConsentContext";
// import { AnalyticsProvider } from "@keiko-app/react-google-analytics";
import App from "./App";
import GDPRBanner from "./components/GDPRBanner";

const AppWithConsent = () => {
  const { consentGiven } = useContext(ConsentContext);

  return (
    <>
      <GDPRBanner />
      {consentGiven ? (
        // <AnalyticsProvider
        //   config={{ measurementId: import.meta.env.VITE_GA_MEASUREMENT_ID }}
        // >
          <App />
        // </AnalyticsProvider>
      ) : (
        <App />
      )}
    </>
  );
};

export default AppWithConsent;
