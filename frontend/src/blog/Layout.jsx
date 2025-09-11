import { Outlet } from "react-router-dom";

import HeaderHomepage from "../pages/homepageComponents/headerHomepage";
import FooterHomepage from "../pages/homepageComponents/FooterHomepage";

function Layout({ backEndUrl, admin, isAdmin, handleLogout }) {
  return (
    <>
      <div className="flex flex-col min-h-screen w-full">
        
        <header
          className="
            w-full bg-gray-800 text-white py-4 px-6
            fixed top-0 left-0
            z-50
          "
        >
          <HeaderHomepage
            backEndUrl={backEndUrl}
            admin={admin}
            handleLogout={handleLogout}
          />            
        </header>

        <main 
          className="
            pt-24
            flex-grow flex items-center justify-center bg-gray-50 w-full
          "
        >
          <Outlet />
        </main>

        <FooterHomepage
          admin={admin}
          isAdmin={isAdmin}
          className="w-full bg-gray-900 text-white relative z-50"
        />
        
      </div>
    </>
  );
}

export default Layout;