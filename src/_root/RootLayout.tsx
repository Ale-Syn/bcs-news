import { Outlet, useLocation } from "react-router-dom";
import { useEffect } from "react";

import Navbar from "@/components/shared/Navbar";
import BrandHeader from "@/components/shared/BrandHeader";
import CategoriesBar from "@/components/shared/CategoriesBar";
import BreakingNewsTicker from "@/components/shared/BreakingNewsTicker";
import AdminTopMenu from "@/components/shared/AdminTopMenu";
import AdminBackBar from "@/components/shared/AdminBackBar";
import Footer from "@/components/shared/Footer";
import AdSenseProvider from "@/components/shared/AdSenseProvider";
import GoogleAd from "@/components/shared/GoogleAd";
import RandomGoogleAd from "@/components/shared/RandomGoogleAd";

const RootLayout = () => {
  const location = useLocation();
  const adminSectionPrefixes = ["/admin", "/create-post", "/all-users"];
  const isAdminSectionRoute = adminSectionPrefixes.some((p) => location.pathname.startsWith(p));
  const adClient = import.meta.env.VITE_ADSENSE_CLIENT as string | undefined;
  const topSlot = import.meta.env.VITE_ADSENSE_TOP_SLOT as string | undefined;
  const topSlotsStr = import.meta.env.VITE_ADSENSE_TOP_SLOTS as string | undefined;
  const topSlots = (topSlotsStr || "")
    .split(",")
    .map((s) => s.trim())
    .filter((s) => !!s);
  const showTopAd = !!adClient && (!!topSlot || topSlots.length > 0);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [location.pathname, location.search]);

  return (
    <AdSenseProvider>
      <div className="w-full min-h-screen flex flex-col">
        <Navbar />
        <div className="flex flex-1 flex-col overflow-y-auto pt-10 md:pt-0">
          <BrandHeader />
          {!isAdminSectionRoute && <BreakingNewsTicker />}
          {!isAdminSectionRoute && showTopAd && (
            <div className="w-full mt-2">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {topSlots.length > 0 ? (
                  <RandomGoogleAd slots={topSlots} style={{ display: "block" }} />
                ) : (
                  <GoogleAd slot={topSlot!} style={{ display: "block" }} />
                )}
              </div>
            </div>
          )}
          {!isAdminSectionRoute && <CategoriesBar />}
          {location.pathname === "/admin/dashboard" && <AdminTopMenu />}
          {isAdminSectionRoute && <AdminBackBar />}
          <main className="flex flex-1">
            <Outlet />
          </main>
          <Footer />
        </div>
      </div>
    </AdSenseProvider>
  );
};

export default RootLayout;
