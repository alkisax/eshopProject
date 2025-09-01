import { createContext, useState } from "react";
import type { ReactNode } from "react"
import type { ParticipantType } from "../types/commerce.types";

export interface VariablesProviderProps {
  children: ReactNode;
}

interface VariablesContextTypes {
  url: string;
  globalParticipant: ParticipantType | null;
  setGlobalParticipant: React.Dispatch<React.SetStateAction<ParticipantType | null>>;
  hasCart: boolean
  setHasCart: React.Dispatch<React.SetStateAction<boolean>>;
}

// eslint-disable-next-line react-refresh/only-export-components
export const VariablesContext = createContext<VariablesContextTypes>({
  url: '',
  globalParticipant: null,
  setGlobalParticipant: () => {},
  hasCart: false,
  setHasCart: () => {}
})

export const VariablesProvider = ({ children }: VariablesProviderProps) => {

    const url: string = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001'

    const [globalParticipant, setGlobalParticipant] = useState<ParticipantType | null>(null);

    const [hasCart, setHasCart] = useState<boolean>(false); 


  return (
    <VariablesContext.Provider value = {{ url, globalParticipant, setGlobalParticipant, hasCart, setHasCart }}>
      {children}
    </VariablesContext.Provider>
  )
}