// tutorial
// https://dev.to/devyoma/authentication-in-react-with-appwrite-4jaj

import { Routes, Route } from "react-router-dom";
import { useContext } from "react";
import { Suspense, lazy } from "react";

import { useInitializer } from "./hooks/useInitializer";
import { VariablesContext } from "./context/VariablesContext";
import { UserAuthContext } from "./context/UserAuthContext";
import Home from "./pages/Home";
import Login from "./authLogin/Login";
import GoogleLogin from "./authLogin/loginGoogle/GoogleLogin";
import AdminPrivateRoute from "./authLogin/service/AdminPrivateRoute";
import RegisterPageBackend from "./authLogin/loginBackend/RegisterPageBackend";
import GithubSuccess from "./authLogin/loginGithub/GithubSuccess";
import GoogleSuccess from "./authLogin/loginGoogle/GoogleSuccess";
import RegisterPageAppwriteLogin from "./authLogin/loginAppwrite/RegisterPageAppwrite";
import HomeAppwriteLogin from "./authLogin/service/Protected";
import PrivateRoute from "./authLogin/service/PrivateRoute";
import LayoutWithNavbar from "./Layouts/LayoutWithNavbar";
import ProfileUser from "./pages/ProfileUser";
import Cart from "./pages/Cart";
import FavoritesPage from "./pages/FavoritesPage";
import ShippingInfo from "./pages/ShippingInfo";
import CheckoutSuccess from "./components/store_components/CheckoutSuccess";
import StoreLayout from "./Layouts/StoreLayout";
import Announcements from "./blog/blogPages/Announcements";
import GAAnalyticsTracker from "./utils/GAAnalyticsTracker";
import LayoutWithNavbarAndFooter from "./Layouts/LayoutWithNavbarAndFooter";
import { CartActionsContext } from "./context/CartActionsContext";
import HomeResponsiveWrapper from "./Layouts/HomeResponsiveWrapper";
import CrossGridLayout from "./Layouts/deisgnComponents/CrossGridLayout";
import AboutPage from "./pages/minorPages/AboutPage";
import Store from "./pages/Store";
import LoadingSkeleton from "./components/skeletons/LoadingSkeleton";
import NotFound from "./pages/NotFound";
import AlternativeLanding from "../themeB/landing_page/Landing";
import AlternativeLayoutWithNavbarAndFooter from "../themeB/AlternativeLayoutWithNavbarAndFooter";
import OrderWaiting from "./pages/OrderWaiting";

// lazy loads  + suspense
const CommodityPage = lazy(
  () => import("./components/store_components/CommodityPage")
);
const BlogPost = lazy(() => import("./blog/blogPages/BlogPost"));
const News = lazy(() => import("./blog/blogPages/News"));
const Contact = lazy(() => import("./pages/minorPages/Contact"));
const Terms = lazy(() => import("./pages/minorPages/Terms"));
const PrivacyPolicy = lazy(() => import("./pages/minorPages/PrivacyPolicy"));
const PaymentMethods = lazy(() => import("./pages/minorPages/PaymentMethods"));
const ShippingMethods = lazy(
  () => import("./pages/minorPages/ShippingMethods")
);
const ReturnPolicy = lazy(() => import("./pages/minorPages/ReturnPolicy"));
const CookiePolicy = lazy(() => import("./pages/minorPages/CookiePolicy"));
// δεν θέλουμε να φορτώνουν οι σελίδες του admin σε όλους για λόγους οικονομίας. Και για αυτό κάναμε όλα τα σχετιά components lazy load και εδώ προσθέσσαμε Suspense. Tο suspense είναι μέσα στο admin private route μεα αποτέλεσμα να μην φορτώνετε καθόλου αν δεν είναι dmin
const AdminPanel = lazy(() => import("./pages/AdminPanel"));
const AdminLayout = lazy(() => import("./Layouts/AdminLayout"));

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
        {/* TODO Εχω βάλει δύο προσορινα endpoints που αργότερα θα πρέπει να αφαιρεθούν */}
        <Route element={<AlternativeLayoutWithNavbarAndFooter />}>
          <Route path="/alternative-header" element={<AlternativeLanding />} />
        </Route>

        <Route element={<LayoutWithNavbarAndFooter />}>
          <Route
            path="/"
            element={
              <HomeResponsiveWrapper>
                <Home />
              </HomeResponsiveWrapper>
            }
          />

          {/* TODO Εχω βάλει δύο προσορινα endpoints που αργότερα θα πρέπει να αφαιρεθούν */}
          <Route path="/alternative" element={<AlternativeLanding />} />

          {/* STORE */}
          {/* used layout as origin of logic for store because its the component that encapsulates al the components. but this propably is not right because thats not the "layout" function. but will leave it as is */}
          {/* layout works together with sidebar and item list */}
          <Route element={<StoreLayout />}>
            <Route path="/store" element={<Store />} />
          </Route>

          {/* lazy pages */}
          <Route
            path="/commodity/:slugOrId"
            element={
              <Suspense fallback={<LoadingSkeleton />}>
                <CommodityPage />
              </Suspense>
            }
          />
          <Route
            path="/news"
            element={
              <Suspense fallback={<LoadingSkeleton />}>
                <News />
              </Suspense>
            }
          />
          <Route
            path="/announcements"
            element={
              <Suspense fallback={<LoadingSkeleton />}>
                <Announcements />
              </Suspense>
            }
          />
          <Route
            path="/posts/:slug"
            element={
              <Suspense fallback={<LoadingSkeleton />}>
                <BlogPost />
              </Suspense>
            }
          />

          {/* Static / Minor Pages — all wrapped in CrossGridLayout */}
          <Route
            path="/contact"
            element={
              <Suspense fallback={<LoadingSkeleton />}>
                <CrossGridLayout title="Επικοινωνία">
                  <Contact />
                </CrossGridLayout>
              </Suspense>
            }
          />
          <Route
            path="/privacy-policy"
            element={
              <Suspense fallback={<LoadingSkeleton />}>
                <CrossGridLayout title="Πολιτική Απορρήτου">
                  <PrivacyPolicy />
                </CrossGridLayout>
              </Suspense>
            }
          />
          <Route
            path="/payment-methods"
            element={
              <Suspense fallback={<LoadingSkeleton />}>
                <CrossGridLayout title="Τρόποι Πληρωμής">
                  <PaymentMethods />
                </CrossGridLayout>
              </Suspense>
            }
          />
          <Route
            path="/shipping-methods"
            element={
              <Suspense fallback={<LoadingSkeleton />}>
                <CrossGridLayout title="Τρόποι Αποστολής">
                  <ShippingMethods />
                </CrossGridLayout>
              </Suspense>
            }
          />
          <Route
            path="/return-policy"
            element={
              <Suspense fallback={<LoadingSkeleton />}>
                <CrossGridLayout title="Πολιτική Επιστροφών">
                  <ReturnPolicy />
                </CrossGridLayout>
              </Suspense>
            }
          />
          <Route
            path="/cookie-policy"
            element={
              <Suspense fallback={<LoadingSkeleton />}>
                <CrossGridLayout title="Πολιτική Cookies">
                  <CookiePolicy />
                </CrossGridLayout>
              </Suspense>
            }
          />

          <Route
            path="/about"
            element={
              <Suspense fallback={<LoadingSkeleton />}>
                <CrossGridLayout title="Σχετικά με Εμάς">
                  <AboutPage />
                </CrossGridLayout>
              </Suspense>
            }
          />
          <Route
            path="/terms"
            element={
              <Suspense fallback={<LoadingSkeleton />}>
                <CrossGridLayout title="Όροι Χρήσης">
                  <Terms />
                </CrossGridLayout>
              </Suspense>
            }
          />

          {/* NON-LAZY */}
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
          <Route path="/order-waiting/:token" element={<OrderWaiting />} />
          <Route path="/cancel" element={<Cart />} />

          <Route element={<PrivateRoute />}>
            <Route path="/protected" element={<HomeAppwriteLogin />} />
            <Route path="/profile" element={<ProfileUser />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Route>

        {/* Admin routes → Navbar only, no Footer */}
        {/* δεν θέλουμε να φορτώνουν οι σελίδες του admin σε όλους για λόγους οικονομίας. Και για αυτό κάναμε όλα τα σχετιά components lazy load και εδώ προσθέσσαμε Suspense */}
        <Route element={<AdminPrivateRoute />}>
          <Route element={<LayoutWithNavbar />}>
            <Route element={<AdminLayout />}>
              <Route
                path="/admin-panel"
                element={
                  <Suspense fallback={<LoadingSkeleton />}>
                    <AdminPanel />
                  </Suspense>
                }
              />
            </Route>
          </Route>
        </Route>
      </Routes>
    </>
  );
}

export default App;
