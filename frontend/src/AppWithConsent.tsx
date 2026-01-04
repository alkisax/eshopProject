// use localStorage.removeItem("ga_consent") to remove consentGiven

import { useContext } from "react";
import { ConsentContext } from "./context/ConsentContext";
import { AnalyticsProvider } from "@keiko-app/react-google-analytics";
import App from "./App";
import GDPRBanner from "./components/GDPRBanner";
import { Helmet } from "react-helmet-async";

const AppWithConsent = () => {
  const { consentGiven } = useContext(ConsentContext);

  if (consentGiven === null) {
    return (
      <>
        <Helmet>
          <title>Have An Idea – Χειροποίητα Κοσμήματα</title>
          <meta
            name="description"
            content="Have An Idea – χειροποίητα κοσμήματα με έμπνευση και μοναδικό σχεδιασμό."
          />
          <meta name="robots" content="index, follow" />
        </Helmet>

        <GDPRBanner />
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>Have An Idea – Χειροποίητα Κοσμήματα</title>
        <meta
          name="description"
          content="Have An Idea – χειροποίητα κοσμήματα με έμπνευση και μοναδικό σχεδιασμό."
        />
        <meta name="robots" content="index, follow" />
      </Helmet>
      <GDPRBanner />
      {consentGiven ? (
        <AnalyticsProvider
          config={{ measurementId: import.meta.env.VITE_GA_MEASUREMENT_ID }}
        >
          <App />
        </AnalyticsProvider>
      ) : (
        <App />
      )}
    </>
  );
};

export default AppWithConsent;
