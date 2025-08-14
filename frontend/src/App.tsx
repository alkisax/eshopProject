import { Routes, Route } from "react-router-dom";

import GoogleLoginTest from "./test_components/LoginGoogle/GoogleLoginTest"
import GoogleSuccess from "./test_components/LoginGoogle/GoogleSuccess"
import LoginAppwriteLogin from "./test_components/LoginAppwrite/ComponentsAppwriteLogin/LoginAppwriteLogin";
import RegisterPageAppwriteLogin from "./test_components/LoginAppwrite/ComponentsAppwriteLogin/RegisterPageAppwrite";
import HomeAppwriteLogin from "./test_components/LoginAppwrite/ComponentsAppwriteLogin/HomeAppwriteLogin";
import PrivateRoute from './test_components/LoginAppwrite/service/PrivateRoute'
import LayoutWithNavbar from './test_components/LoginAppwrite/AppwriteLayout/LayoutWithNavbar'

function App() {

  const url: string = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001'


  return (
    <>
    <Routes>
      <Route element={<LayoutWithNavbar />}>
        <Route path="/" element={<GoogleLoginTest url={url} />} />
        <Route path="/signup" element={<GoogleLoginTest url={url} />} />
        <Route path="/google-success" element={<GoogleSuccess />} />

        <Route element={<PrivateRoute />}>
          <Route path="/appwrite-home" element={<HomeAppwriteLogin />} />        
        </Route>

        <Route path="/appwrite-login" element={<LoginAppwriteLogin url={url} />} />
        <Route path="/register" element={<RegisterPageAppwriteLogin />} />
      </Route>
    </Routes>
    </>
  )
}

export default App
