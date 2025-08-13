import { Routes, Route } from "react-router-dom";

import GoogleLoginTest from "./test_components/GoogleLoginTest"
import GoogleSuccess from "./test_components/GoogleSuccess"

function App() {

  const url: string = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001'


  return (
    <>
      <GoogleLoginTest url={url}/>

      <Routes> 
        <Route 
            path="/google-success"
            element={<GoogleSuccess />}
          />
      </Routes>  
    </>
  )
}

export default App
