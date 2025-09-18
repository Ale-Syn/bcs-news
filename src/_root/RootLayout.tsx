import { Outlet, useLocation } from "react-router-dom";

import Navbar from "@/components/shared/Navbar";
import BrandHeader from "@/components/shared/BrandHeader";
import CategoriesBar from "@/components/shared/CategoriesBar";
import BreakingNewsTicker from "@/components/shared/BreakingNewsTicker";
import AdminTopMenu from "@/components/shared/AdminTopMenu";
import AdminBackBar from "@/components/shared/AdminBackBar";
import Footer from "@/components/shared/Footer";

const RootLayout = () => {
  const location = useLocation();
  const adminSectionPrefixes = ["/admin", "/create-post", "/all-users"];
  const isAdminSectionRoute = adminSectionPrefixes.some((p) => location.pathname.startsWith(p));
  return (
    <div className="w-full min-h-screen flex flex-col">
      <Navbar />
      <div className="flex flex-1 flex-col overflow-y-auto pt-10 md:pt-0">
        <BrandHeader />
        {!isAdminSectionRoute && <BreakingNewsTicker />}
        {location.pathname === "/" && <CategoriesBar />}
        {location.pathname === "/admin/dashboard" && <AdminTopMenu />}
        {isAdminSectionRoute && <AdminBackBar />}
        <main className="flex flex-1">
          <Outlet />
        </main>
        <Footer />
      </div>
    </div>
  );
};

export default RootLayout;
