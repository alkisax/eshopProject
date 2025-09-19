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
