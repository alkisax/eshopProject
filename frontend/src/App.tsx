// tutorial
// https://dev.to/devyoma/authentication-in-react-with-appwrite-4jaj

import { Routes, Route } from "react-router-dom";
import { useContext } from "react";

import { useInitializer } from "./hooks/useInitializer";
import { VariablesContext } from "./context/VariablesContext";
import { UserAuthContext } from "./context/UserAuthContext";
import Home from "./pages/Home";
import Login from "./authLogin/Login";
import GoogleLogin from "./authLogin/loginGoogle/GoogleLogin";
import AdminPanel from "./pages/AdminPanel";
import AdminPrivateRoute from "./authLogin/service/AdminPrivateRoute";
import RegisterPageBackend from "./authLogin/loginBackend/RegisterPageBackend";
import GithubSuccess from "./authLogin/loginGithub/GithubSuccess";
import GoogleSuccess from "./authLogin/loginGoogle/GoogleSuccess";
import RegisterPageAppwriteLogin from "./authLogin/loginAppwrite/RegisterPageAppwrite";
import HomeAppwriteLogin from "./authLogin/service/Protected";
import PrivateRoute from "./authLogin/service/PrivateRoute";
import LayoutWithNavbar from "./Layouts/LayoutWithNavbar";
import AdminLayout from "./Layouts/AdminLayout";
import ProfileUser from "./pages/ProfileUser";
import Store from "./pages/Store";
import Cart from "./pages/Cart";
import FavoritesPage from "./pages/FavoritesPage";
import ShippingInfo from "./pages/ShippingInfo";
import CheckoutSuccess from "./components/store_components/CheckoutSuccess";
import CommodityPage from "./components/store_components/CommodityPage";
import StoreLayout from "./Layouts/StoreLayout";
import AdminAddNewCommodity from "./components/store_components/adminPannelCommodity/AdminAddNewCommodity";
import Announcements from "./blog/blogPages/Announcements";
import News from "./blog/blogPages/News";
import BlogPost from "./blog/blogPages/BlogPost";
import Contact from "./pages/minorPages/Contact";
import Terms from "./pages/minorPages/Terms";
import PrivacyPolicy from "./pages/minorPages/PrivacyPolicy";
import PaymentMethods from "./pages/minorPages/PaymentMethods";
import ShippingMethods from "./pages/minorPages/ShippingMethods";
import ReturnPolicy from "./pages/minorPages/ReturnPolicy";
import CookiePolicy from "./pages/minorPages/CookiePolicy";

import GAAnalyticsTracker from "./utils/GAAnalyticsTracker";
import LayoutWithNavbarAndFooter from "./Layouts/LayoutWithNavbarAndFooter";
import { CartActionsContext } from "./context/CartActionsContext";
import HomeResponsiveWrapper from "./Layouts/HomeResponsiveWrapper";
import CrossGridLayout from "./Layouts/deisgnComponents/CrossGridLayout";
import AboutPage from "./pages/minorPages/AboutPage";

function App() {
  const { user } = useContext(UserAuthContext);
  const { setGlobalParticipant, setHasCart, setHasFavorites } =
    useContext(VariablesContext);
  const { setCartCount } = useContext(CartActionsContext);
  const url: string =
    import.meta.env.VITE_BACKEND_URL || "http://localhost:3001";

  useInitializer(
    user,
    url,
    setHasCart,
    setHasFavorites,
    setGlobalParticipant,
    setCartCount
  );

  return (
    <>
      {/* Google analytics initializer */}
      <GAAnalyticsTracker />

      <Routes>
        <Route element={<LayoutWithNavbarAndFooter />}>
          {/* <Route path="/" element={<Home />} /> */}
          <Route
            path="/"
            element={
              <HomeResponsiveWrapper>
                <Home />
              </HomeResponsiveWrapper>
            }
          />
          <Route path="/news" element={<News />} />
          <Route path="/announcements" element={<Announcements />} />
          <Route path="/posts/:slug" element={<BlogPost />} />

          {/* used layout as origin of logic for store because its the component that encapsulates al the components. but this propably is not right because thats not the "layout" function. but will leave it as is */}
          {/* layout works together with sidebar and item list */}
          <Route element={<StoreLayout />}>
            <Route path="/store" element={<Store />} />
          </Route>

          <Route path="/commodity/:slugOrId" element={<CommodityPage />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/shipping-info" element={<ShippingInfo />} />
          <Route path="/favorites" element={<FavoritesPage />} />

          <Route path="/login" element={<Login url={url} />} />
          <Route path="/signup" element={<GoogleLogin url={url} />} />
          <Route
            path="/register-appwrite"
            element={<RegisterPageAppwriteLogin />}
          />
          <Route
            path="/register-backend"
            element={<RegisterPageBackend url={url} />}
          />
          <Route path="/google-success" element={<GoogleSuccess />} />
          <Route path="/github-success" element={<GithubSuccess />} />
          <Route path="/checkout-success" element={<CheckoutSuccess />} />

          <Route element={<PrivateRoute />}>
            <Route path="/protected" element={<HomeAppwriteLogin />} />
            <Route path="/profile" element={<ProfileUser />} />
          </Route>

          {/* Static / Minor Pages — all wrapped in CrossGridLayout */}
          <Route
            path="/contact"
            element={
              <CrossGridLayout title="Επικοινωνία">
                <Contact />
              </CrossGridLayout>
            }
          />

          <Route
            path="/privacy-policy"
            element={
              <CrossGridLayout title="Πολιτική Απορρήτου">
                <PrivacyPolicy />
              </CrossGridLayout>
            }
          />

          <Route
            path="/payment-methods"
            element={
              <CrossGridLayout title="Τρόποι Πληρωμής">
                <PaymentMethods />
              </CrossGridLayout>
            }
          />

          <Route
            path="/shipping-methods"
            element={
              <CrossGridLayout title="Τρόποι Αποστολής">
                <ShippingMethods />
              </CrossGridLayout>
            }
          />

          <Route
            path="/return-policy"
            element={
              <CrossGridLayout title="Πολιτική Επιστροφών">
                <ReturnPolicy />
              </CrossGridLayout>
            }
          />

          <Route
            path="/cookie-policy"
            element={
              <CrossGridLayout title="Πολιτική Cookies">
                <CookiePolicy />
              </CrossGridLayout>
            }
          />

          <Route
            path="/about"
            element={
              <CrossGridLayout title="Σχετικά με Εμάς">
                <AboutPage />
              </CrossGridLayout>
            }
          />

          <Route
            path="/terms"
            element={
              <CrossGridLayout title="Όροι Χρήσης">
                <Terms />
              </CrossGridLayout>
            }
          />
        </Route>

        {/* Admin routes → Navbar only, no Footer */}
        <Route element={<AdminPrivateRoute />}>
          <Route element={<LayoutWithNavbar />}>
            <Route element={<AdminLayout />}>
              <Route path="/admin-panel" element={<AdminPanel />} />
              <Route
                path="/admin-panel/commodity/new"
                element={<AdminAddNewCommodity />}
              />
            </Route>
          </Route>
        </Route>
      </Routes>
    </>
  );
}

export default App;
