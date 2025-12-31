// frontend\src\hooks\useThemeColors.ts
// αυτό το hook κατασκευάστικε για να καλούμε απο ένα σημείο μόνο τα κεντρικά χρώμματα 

import { useSettings } from '../context/SettingsContext';

export const DEFAULT_THEME = {
  primary: '#48C4Cf',
  secondary: '#FFD500',
};

export const useThemeColors = () => {
  const { settings, loading } = useSettings();

  if (loading || !settings?.theme) {
    return DEFAULT_THEME;
  }

  return {
    primary: settings.theme.primaryColor || DEFAULT_THEME.primary,
    secondary: settings.theme.secondaryColor || DEFAULT_THEME.secondary,
  };
};
