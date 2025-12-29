/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import axios from "axios";
import { VariablesContext } from "./VariablesContext";

type Settings = {
  branding?: {
    themeLogo?: string;
    headerFooterLogo?: string;
  };
  homeTexts?: {
    homeText1?: string;
    homeText2?: string;
    homeText3?: string;
  };
};

//ΣΥΜΒΟΛΑΙΟ: όποιος κάνει useContext θα πάρει ΑΥΤΟ.
type SettingsContextValue = {
  settings: Settings | null;
  loading: boolean;
  refreshSettings: () => Promise<void>;
};

const SettingsContext = createContext<SettingsContextValue>({
  settings: null,
  loading: true,
  refreshSettings: async () => {},
});

export const SettingsProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { url } = useContext(VariablesContext);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    const res = await axios.get(`${url}/api/settings`);
    setSettings(res.data.data);
    setLoading(false);
  }, [url]);

  useEffect(() => {
    fetchSettings();
    axios
      .get(`${url}/api/settings`)
      .then((res) => setSettings(res.data.data))
      .finally(() => setLoading(false));
  }, [fetchSettings, url]);

  return (
    <SettingsContext.Provider
      value={{ settings, loading, refreshSettings: fetchSettings }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => useContext(SettingsContext);
