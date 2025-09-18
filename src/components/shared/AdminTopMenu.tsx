import { Link, useLocation } from "react-router-dom";

const AdminTopMenu = () => {
  const location = useLocation();
  const adminLinks = [
    { label: "Dashboard", route: "/admin/dashboard" },
    { label: "Añadir", route: "/create-post" },
    { label: "Usuarios", route: "/all-users" },
    { label: "Categorías", route: "/admin/categories" },
    { label: "Anuncios", route: "/admin/ads" },
  ];

  return (
    <div className="w-full bg-[#BB1919]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 overflow-x-auto">
        <div className="flex items-center gap-2 sm:gap-4 py-1.5 whitespace-nowrap">
          {adminLinks.map((l) => (
            <Link
              key={l.label}
              to={l.route}
              className={
                `text-[13px] sm:text-sm font-semibold uppercase tracking-wide px-3 py-2 rounded-md transition-colors ` +
                (location.pathname === l.route
                  ? "bg-white text-[#BB1919]"
                  : "text-white hover:bg-white/10")
              }
            >
              {l.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminTopMenu;


