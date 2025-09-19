// import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { UserProvider } from "./context/UserAuthContext.tsx"; 
import { VariablesProvider } from './context/VariablesContext.tsx';
import App from './App.tsx'
import { CartActionsProvider } from './context/CartActionsContext.tsx';
import { AiModerationProvider } from './context/AiModerationContext.tsx';
import { AnalyticsProvider } from "@keiko-app/react-google-analytics"

createRoot(document.getElementById('root')!).render(
  // <StrictMode>

     <BrowserRouter>
      <UserProvider>
        <VariablesProvider>
          <CartActionsProvider>
            <AiModerationProvider>
              <AnalyticsProvider
                config={{ measurementId: import.meta.env.VITE_GA_MEASUREMENT_ID }}
              >
                  <App />
              </AnalyticsProvider>
            </AiModerationProvider>
          </CartActionsProvider>
        </VariablesProvider>
      </UserProvider>
    </BrowserRouter>   

  // </StrictMode>,
)