// src/context/AiModerationContext.tsx
/* eslint-disable react-refresh/only-export-components */
import { createContext, useState } from "react";
import type { ReactNode } from "react";

interface AiModerationContextType {
  aiModerationEnabled: boolean;
  setAiModerationEnabled: (val: boolean) => void;
}

export const AiModerationContext = createContext<AiModerationContextType>({
  aiModerationEnabled: false,
  setAiModerationEnabled: () => {},
});

export const AiModerationProvider = ({ children }: { children: ReactNode }) => {
  const [aiModerationEnabled, setAiModerationEnabled] = useState(false);

  return (
    <AiModerationContext.Provider value={{ aiModerationEnabled, setAiModerationEnabled }}>
      {children}
    </AiModerationContext.Provider>
  );
};
