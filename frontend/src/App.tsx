
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
import GoogleSuccess from "./authLogin/loginGoogle/GoogleSuccess"
import RegisterPageAppwriteLogin from "./authLogin/loginAppwrite/RegisterPageAppwrite";
import HomeAppwriteLogin from "./authLogin/service/Protected";
import PrivateRoute from './authLogin/service/PrivateRoute'
import LayoutWithNavbar from './Layouts/LayoutWithNavbar'
import AdminLayout from "./Layouts/AdminLayout"
import ProfileUser from './pages/ProfileUser'
import Store from './pages/Store'

function App() {

  const url: string = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001'


  return (
    <>
    <Routes>
      <Route element={<LayoutWithNavbar />}>

        <Route path="/" element={<Home url={url} />} />
        <Route path="/store" element={<Store />} />
        

        <Route path="/login" element={<Login url={url} />} />
        <Route path="/signup" element={<GoogleLogin url={url} />} />
        <Route path="/register-appwrite" element={<RegisterPageAppwriteLogin />} />
        <Route path="/register-backend" element={<RegisterPageBackend url={url} />} />        
        <Route path="/google-success" element={<GoogleSuccess />} />
        <Route path="/github-success" element={<GithubSuccess />} />

        <Route element={<PrivateRoute />}>
          <Route path="/protected" element={<HomeAppwriteLogin />} />
          <Route path="/profile" element={<ProfileUser />} />
        </Route>

        <Route element={<AdminPrivateRoute />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin-panel" element={<AdminPanel />} />           
          </Route>
        </Route>
        
      </Route>
    </Routes>
    </>
  )
}

export default App
