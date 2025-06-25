import { Outlet } from "react-router-dom";

import Navbar from "@/components/shared/Navbar";
import Footer from "@/components/shared/Footer";

const RootLayout = () => {
  return (
    <div className="w-full min-h-screen flex flex-col">
      <Navbar />
      <div className="flex flex-1 flex-col overflow-y-auto pt-16">
        <main className="flex flex-1">
          <Outlet />
        </main>
        <Footer />
      </div>
    </div>
  );
};

export default RootLayout;
