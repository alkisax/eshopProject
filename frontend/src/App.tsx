
// tutorial
// https://dev.to/devyoma/authentication-in-react-with-appwrite-4jaj


import { Routes, Route } from "react-router-dom"
import Home from './pages/Home'
import Login from './authLogin/Login'
import GoogleLogin from './authLogin/loginGoogle/GoogleLogin'
import AdminPanel from "./pages/AdminPanel"
import AdminPrivateRoute from "./authLogin/service/AdminPrivateRoute"
import RegisterPageBackend from "./authLogin/loginBackend/RegisterPageBackend"
import GithubSuccess from './authLogin/loginGithub/GithubSuccess'
// import LoginBackend from "./authLogin/loginBackend/LoginBackend"

import GoogleSuccess from "./authLogin/loginGoogle/GoogleSuccess"
import LoginAppwriteLogin from "./authLogin/loginAppwrite/LoginAppwrite";
import RegisterPageAppwriteLogin from "./authLogin/loginAppwrite/RegisterPageAppwrite";
import HomeAppwriteLogin from "./authLogin/service/Protected";
import PrivateRoute from './authLogin/service/PrivateRoute'
import LayoutWithNavbar from './Layouts/LayoutWithNavbar'

function App() {

  const url: string = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001'


  return (
    <>
    <Routes>
      <Route element={<LayoutWithNavbar />}>

        <Route path="/login" element={<Login url={url} />} />
        <Route path="/" element={<Home url={url} />} />

        <Route path="/signup" element={<GoogleLogin url={url} />} />
        <Route path="/google-success" element={<GoogleSuccess />} />

        <Route element={<PrivateRoute />}>
          <Route path="/protected" element={<HomeAppwriteLogin />} />
        </Route>
        <Route element={<AdminPrivateRoute />}>
          <Route path="/admin-panel" element={<AdminPanel />} />       
        </Route>

        {/* <Route path="/login-backend" element={<LoginBackend url={url} />} /> */}
        <Route path="/register-backend" element={<RegisterPageBackend url={url} />} />

        <Route path="/appwrite-login" element={<LoginAppwriteLogin url={url} />} />
        <Route path="/register-appwrite" element={<RegisterPageAppwriteLogin />} />

        <Route path="/github-success" element={<GithubSuccess />} />
      </Route>
    </Routes>
    </>
  )
}

export default App
