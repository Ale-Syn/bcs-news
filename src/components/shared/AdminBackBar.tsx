import { Link, useLocation } from "react-router-dom";

const AdminBackBar = () => {
  const location = useLocation();
  if (location.pathname === "/admin/dashboard") return null;

  return (
    <div className="w-full bg-[#BB1919]/5 border-b border-[#E5E5E5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-2">
          <Link
            to="/admin/dashboard"
            className="inline-flex items-center text-sm font-semibold text-[#BB1919] hover:text-[#A01717]"
          >
            <img src="/assets/icons/back.svg" alt="volver" className="h-4 w-4 mr-2" />
            Volver al Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminBackBar;


