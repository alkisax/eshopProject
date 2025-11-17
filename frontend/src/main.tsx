// https://www.youtube.com/watch?v=wWeG8rWkMsM seo ➡️ helmet/sitmap.txt/google search console

// import { StrictMode } from 'react'
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { UserProvider } from "./context/UserAuthContext.tsx";
import { VariablesProvider } from "./context/VariablesContext.tsx";
import { CartActionsProvider } from "./context/CartActionsContext.tsx";
import { AiModerationProvider } from "./context/AiModerationContext.tsx";
import { ConsentProvider } from "./context/ConsentContext.tsx";
import AppWithConsent from "./AppWithConsent.tsx";
import { ThemeProvider } from "@emotion/react";
import theme  from './theme/theme'

createRoot(document.getElementById("root")!).render(
  // <StrictMode>

  <BrowserRouter>
    <HelmetProvider>
      <UserProvider>
        <VariablesProvider>
          <CartActionsProvider>
            <AiModerationProvider>
              <ThemeProvider theme={theme}>
                <ConsentProvider>
                  <AppWithConsent />
                </ConsentProvider>
              </ThemeProvider>
            </AiModerationProvider>
          </CartActionsProvider>
        </VariablesProvider>
      </UserProvider>
    </HelmetProvider>
  </BrowserRouter>

  // </StrictMode>,
);
