
// tutorial
// https://dev.to/devyoma/authentication-in-react-with-appwrite-4jaj

import { Routes, Route } from "react-router-dom"
import { useContext } from "react";

import { useInitializer } from "./hooks/useInitializer";
import { VariablesContext } from "./context/VariablesContext";
import { UserAuthContext } from "./context/UserAuthContext";

// import GAAnalyticsTracker from "./utils/GAAnalyticsTracker";

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
import Cart from "./pages/Cart";
import ShippingInfo from "./pages/ShippingInfo";
import CheckoutSuccess from "./components/store_components/CheckoutSuccess";
import CommodityPage from "./components/store_components/CommodityPage";
import StoreLayout from "./Layouts/StoreLayout"
import AdminAddNewCommodity from "./components/store_components/adminPannelCommodity/AdminAddNewCommodity";
import Announcements from "./blog/blogPages/Announcements";
import News from "./blog/blogPages/News";
import BlogPost from "./blog/blogPages/BlogPost";
import Contact from "./pages/minorPages/Contact";

function App() {
  const { user } = useContext(UserAuthContext);
  const { setGlobalParticipant, setHasCart } = useContext(VariablesContext);
  const url: string = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001'

  useInitializer(user, url, setHasCart, setGlobalParticipant);

  return (
    <>
    {/* Google analytics initializer */}
    {/* <GAAnalyticsTracker /> */}

    <Routes>
      <Route element={<LayoutWithNavbar />}>

        <Route path="/" element={<Home />} />
        <Route path="/news" element={<News />} />
        <Route path="/announcements" element={<Announcements />} />
        <Route path="/posts/:slug" element={<BlogPost />} />
        
        {/* used layout as origin of logic for store because its the component that encapsulates al the components. but this propably is not right because thats not the "layout" function. but will leave it as is */}
        {/* layout works together with sidebar and item list */}
        <Route element={<StoreLayout />} >
          <Route path="/store" element={<Store />} />
        </Route>

        <Route path="/commodity/:id" element={<CommodityPage />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/shipping-info" element={<ShippingInfo />} />
        
        <Route path="/login" element={<Login url={url} />} />
        <Route path="/signup" element={<GoogleLogin url={url} />} />
        <Route path="/register-appwrite" element={<RegisterPageAppwriteLogin />} />
        <Route path="/register-backend" element={<RegisterPageBackend url={url} />} />        
        <Route path="/google-success" element={<GoogleSuccess />} />
        <Route path="/github-success" element={<GithubSuccess />} />
        <Route path="/checkout-success" element={<CheckoutSuccess />} />

        <Route element={<PrivateRoute />}>
          <Route path="/protected" element={<HomeAppwriteLogin />} />
          <Route path="/profile" element={<ProfileUser />} />
        </Route>

        <Route element={<AdminPrivateRoute />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin-panel" element={<AdminPanel />} />
            <Route path="/admin-panel/commodity/new" element={<AdminAddNewCommodity />} />  
          </Route>
        </Route>

        <Route path="/contact" element={<Contact />} />
        
      </Route>
    </Routes>
    </>
  )
}

export default App
