import React, { createContext, useCallback, useEffect, useState } from "react";
import type { ReactNode } from "react"
import type { ParticipantType, CategoryType } from "../types/commerce.types";
import axios from "axios";

export interface VariablesProviderProps {
  children: ReactNode;
}

interface VariablesContextTypes {
  url: string;
  globalParticipant: ParticipantType | null;
  setGlobalParticipant: React.Dispatch<React.SetStateAction<ParticipantType | null>>;
  hasFavorites: boolean;
  setHasFavorites: React.Dispatch<React.SetStateAction<boolean>>;
  hasCart: boolean
  setHasCart: React.Dispatch<React.SetStateAction<boolean>>;
  categories: CategoryType[],
  refreshCategories: () => Promise<void>; // ✅ function, not state setter
}

// eslint-disable-next-line react-refresh/only-export-components
export const VariablesContext = createContext<VariablesContextTypes>({
  url: '',
  globalParticipant: null,
  setGlobalParticipant: () => {},
  hasCart: false,
  setHasCart: () => {},
  hasFavorites: false,
  setHasFavorites: () => {},
  categories: [],
  refreshCategories: async () => {},
})

export const VariablesProvider = ({ children }: VariablesProviderProps) => {

    const url: string = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001'

    const [globalParticipant, setGlobalParticipant] = useState<ParticipantType | null>(null);

    const [hasCart, setHasCart] = useState<boolean>(false);

    const [hasFavorites, setHasFavorites] = useState(false);

    const [categories, setCategories] = useState<CategoryType[]>([]);

    const refreshCategories = useCallback( async () => {
      try {
        // Prefer your dedicated Category API
        const res = await axios.get<{ status: boolean; data: CategoryType[] }>(`${url}/api/category`);
        if (res.data.status) {
          // χρησιμοποιήσαμε sread γιατι η sort κάνει αλλαγές στο αρχικό array
          const sorted = [...res.data.data]
            // για να τα βάλει σε αλφαβητικη
            .sort((a, b) => a.name.localeCompare(b.name));
          setCategories(sorted);
        }
      } catch (e) {
        console.warn("Failed to load categories", e);
        setCategories([]); 
      }
    }, [url]);

    useEffect(() => {
      // load once on app start
      refreshCategories();
    }, [refreshCategories, url]);


  return (
    <VariablesContext.Provider value = {{ url, globalParticipant, setGlobalParticipant, hasFavorites, setHasFavorites, hasCart, setHasCart, categories, refreshCategories }}>
      {children}
    </VariablesContext.Provider>
  )
}