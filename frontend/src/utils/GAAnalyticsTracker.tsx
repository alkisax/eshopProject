// https://medium.com/@nicolas.nunge/how-to-integrate-google-analytics-ga4-into-a-reactjs-app-in-2025-b62e121d4590

// its all commented out. relevant files
// tracks item page visit and item accurances in list
// frontend\src\components\store_components\StoreItemList.tsx
// frontend\src\components\GDPRBanner.tsx
// context that saves if approved after banner
// frontend\src\context\ConsentContext.tsx
// need to lift context to main. cant lift in ts only in tsx so sortcuted it with appwithconsent
// frontend\src\App.tsx
// frontend\src\AppWithConsent.tsx
// frontend\src\main.tsx

import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useAnalytics } from "@keiko-app/react-google-analytics";

const GAAnalyticsTracker = () => {
  const location = useLocation();
  const { tracker } = useAnalytics();

  useEffect(() => {
    tracker.trackPageView({});
  }, [location, tracker]);

  return null;
};

export default GAAnalyticsTracker;
