/* eslint-disable react-refresh/only-export-components */
import { createContext, useState, useEffect } from "react";

type ConsentContextType = {
  consentGiven: boolean | null; // null = undecided
  setConsentGiven: (value: boolean) => void;
};

export const ConsentContext = createContext<ConsentContextType>({
  consentGiven: null,
  setConsentGiven: () => {},
});

export const ConsentProvider = ({ children }: { children: React.ReactNode }) => {
  const [consentGiven, setConsentGiven] = useState<boolean | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("ga_consent");
    if (stored !== null) setConsentGiven(stored === "true");
  }, []);

  const handleSetConsent = (value: boolean) => {
    localStorage.setItem("ga_consent", String(value));
    setConsentGiven(value);
  };

  return (
    <ConsentContext.Provider value={{ consentGiven, setConsentGiven: handleSetConsent }}>
      {children}
    </ConsentContext.Provider>
  );
};