import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { UserProvider } from "./test_components/LoginAppwrite/UserAuthContext.tsx"; 
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <UserProvider>
        <App />        
      </UserProvider>
    </BrowserRouter>
  </StrictMode>,
)