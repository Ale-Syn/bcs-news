import { Link, useParams, useNavigate } from "react-router-dom";
import { useGetRecentPosts, useGetCategories, useSignOutAccount } from "@/lib/react-query/queries";
import { Models } from "appwrite";
import { useEffect, useRef, useState } from "react";
import { useUserContext, INITIAL_USER } from "@/context/AuthContext";

const CategoriesBar = () => {
  const { location: locationParam, category: categoryParam } = useParams();
  const currentParam = categoryParam || locationParam;

  const { data: categoriesData } = useGetCategories();
  const { data: recentPosts } = useGetRecentPosts();
  const { user, setUser, setIsAuthenticated } = useUserContext();
  const navigate = useNavigate();
  const { mutate: signOut } = useSignOutAccount();
  const isAdmin = user?.role === "ADMIN";
  const [isAdminMenuOpen, setIsAdminMenuOpen] = useState(false);
  const adminRef = useRef<HTMLDivElement>(null);

  const categories = categoriesData?.documents || [];
  const locations =
    categories.length > 0
      ? categories.map((cat: Models.Document) => cat.name)
      : recentPosts?.documents?.reduce((acc: string[], post: any) => {
          if (post.location && !acc.includes(post.location)) acc.push(post.location);
          return acc;
        }, []) || [];

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (adminRef.current && !adminRef.current.contains(e.target as Node)) {
        setIsAdminMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const adminLinks = [
    { label: "Inicio", route: "/" },
    { label: "Dashboard", route: "/admin/dashboard" },
    { label: "Añadir", route: "/create-post" },
    { label: "Usuarios", route: "/all-users" },
    { label: "Categorías", route: "/admin/categories" },
    { label: "Anuncios", route: "/admin/ads" },
  ];

  return (
    <div className="bg-[#BB1919] sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-1.5">
          {/* Links de categorías (scroll horizontal) */}
          <div className="flex-1 min-w-0 overflow-x-auto">
            <div className="flex items-center gap-2 sm:gap-4 whitespace-nowrap divide-x divide-white/20">
              <Link
                to="/"
                className={`text-[13px] sm:text-sm font-semibold uppercase tracking-wide px-3 py-2 rounded-md transition-colors ${
                  !currentParam ? 'bg-white text-[#BB1919]' : 'text-white hover:bg-white/10'
                }`}
              >
                Todas
              </Link>
              {locations.map((loc: string) => (
                <Link
                  key={loc}
                  to={`/${encodeURIComponent(loc)}`}
                  className={`text-[13px] sm:text-sm font-semibold uppercase tracking-wide px-3 py-2 rounded-md transition-colors ${
                    decodeURIComponent(currentParam || '') === loc ? 'bg-white text-[#BB1919]' : 'text-white hover:bg-white/10'
                  }`}
                >
                  {loc}
                </Link>
              ))}
            </div>
          </div>

          {/* Botón Admin (derecha) */}
          {isAdmin && (
            <div className="relative ml-3 flex-shrink-0" ref={adminRef}>
              <button
                className="px-3 py-2 text-sm font-semibold uppercase tracking-wide text-white rounded-md hover:bg-white/10"
                onClick={() => setIsAdminMenuOpen((v) => !v)}
              >
                Admin
              </button>
              {isAdminMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-[#E5E5E5] rounded-lg shadow-lg z-50">
                  <div className="py-1">
                    {adminLinks.map((l) => (
                      <Link
                        key={l.label}
                        to={l.route}
                        className="block px-3 py-2 text-sm text-[#1A1A1A] hover:bg-[#F5F5F5]"
                        onClick={() => setIsAdminMenuOpen(false)}
                      >
                        {l.label}
                      </Link>
                    ))}
                    <button
                      className="w-full text-left block px-3 py-2 text-sm text-[#BB1919] hover:bg-[#FDECEC]"
                      onClick={() => {
                        setIsAdminMenuOpen(false);
                        signOut(undefined, {
                          onSettled: () => {
                            try {
                              localStorage.removeItem('user');
                              localStorage.removeItem('cookieFallback');
                            } catch {}
                            setIsAuthenticated(false);
                            setUser(INITIAL_USER);
                            navigate("/");
                          },
                        });
                      }}
                    >
                      Cerrar sesión
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CategoriesBar;


