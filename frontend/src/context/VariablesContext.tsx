import { createContext } from "react";
import type { ReactNode } from "react"

export interface VariablesProviderProps {
  children: ReactNode;
}

interface VariablesContextTypes {
  url: string  
}

// eslint-disable-next-line react-refresh/only-export-components
export const VariablesContext = createContext<VariablesContextTypes>({
  url: ''
})

export const VariablesProvider = ({ children }: VariablesProviderProps) => {

    const url: string = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001'

  return (
    <VariablesContext.Provider value = {{ url }}>
      {children}
    </VariablesContext.Provider>
  )
}