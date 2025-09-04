// import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { UserProvider } from "./context/UserAuthContext.tsx"; 
import { VariablesProvider } from './context/VariablesContext.tsx';
import App from './App.tsx'
import { CartActionsProvider } from './context/CartActionsContext.tsx';

createRoot(document.getElementById('root')!).render(
  // <StrictMode>

     <BrowserRouter>
      <UserProvider>
        <VariablesProvider>
          <CartActionsProvider>
              <App />    
          </CartActionsProvider>
        </VariablesProvider>
      </UserProvider>
    </BrowserRouter>   

  // </StrictMode>,
)