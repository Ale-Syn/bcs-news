import { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { Menu, X, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import { useUserContext } from "@/context/AuthContext";
import { useSignOutAccount, useGetPosts, useGetRecentPosts } from "@/lib/react-query/queries";
import { Input } from "../ui/input";
import { useDebounce } from "@/hooks/useDebounce";

// Public navigation items (for all users)
const publicLinks = [
  {
    imgURL: "/assets/icons/home.svg",
    route: "/",
    label: "Inicio",
  },
  {
    imgURL: "/assets/icons/wallpaper.svg",
    route: "/explore",
    label: "Noticias",
  },
];

// Authenticated user navigation items
const userLinks = [
  {
    imgURL: "/assets/icons/bookmark.svg",
    route: "/saved",
    label: "Guardados",
  },
];

// Admin-specific navigation items
const adminLinks = [
  {
    imgURL: "/assets/icons/activity.svg",
    route: "/admin/dashboard",
    label: "Dashboard",
  },
  {
    imgURL: "/assets/icons/people.svg",
    route: "/all-users",
    label: "Usuarios",
  },
  {
    imgURL: "/assets/icons/add-post.svg",
    route: "/create-post",
    label: "Añadir",
  },
];

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [currentTime, setCurrentTime] = useState(new Date());
  const searchRef = useRef<HTMLDivElement>(null);
  const debouncedSearch = useDebounce(searchQuery, 300);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useUserContext();
  const { mutate: signOut, isSuccess } = useSignOutAccount();
  const { data: postsData } = useGetPosts();
  const { data: recentPosts } = useGetRecentPosts();
  const { location: locationParam } = useParams();

  // Admin check - make sure we're properly checking the role
  const isAdmin = user?.role === "ADMIN";

  // Get unique locations from posts for categories
  const locations =
    recentPosts?.documents.reduce((acc: string[], post) => {
      if (post.location && !acc.includes(post.location)) {
        acc.push(post.location);
      }
      return acc;
    }, []) || [];

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Handle search
  useEffect(() => {
    if (debouncedSearch && postsData) {
      const searchTerm = debouncedSearch.toLowerCase();
      const results = postsData.pages.reduce((acc: any[], page) => {
        const pageResults = page.documents.filter((post: any) => {
          const titleMatch = post.title?.toLowerCase().includes(searchTerm);
          const captionMatch = post.caption?.toLowerCase().includes(searchTerm);
          const locationMatch = post.location
            ?.toLowerCase()
            .includes(searchTerm);
          return titleMatch || captionMatch || locationMatch;
        });
        return [...acc, ...pageResults];
      }, []);
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  }, [debouncedSearch, postsData]);

  // Handle click outside search
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setIsSearchOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (isSuccess) navigate(0);
  }, [isSuccess]);

  // Handle time update
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <nav
      className={cn(
        "fixed top-0 w-full z-50 transition-all duration-300",
        isScrolled ? "bg-[#BB1919] shadow-md" : "bg-[#BB1919]"
      )}>
      {/* Top Bar - Logo and User Actions */}
      <div className="border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-12">
            {/* Logo */}
            <Link to="/" className="flex items-center">
              <img
                src="/assets/images/logo.svg"
                alt="logo"
                width={130}
                height={325}
                className="h-6 w-auto brightness-0 invert"
              />
            </Link>

            {/* User Actions */}
            <div className="flex items-center space-x-4">
              {/* Current Time */}
              <div className="text-white font-medium">
                {currentTime.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
              </div>
              
              {/* Search Button and Dropdown */}
              <div className="relative" ref={searchRef}>
                <button
                  className="p-2 rounded-full hover:bg-white/10"
                  onClick={() => setIsSearchOpen(!isSearchOpen)}>
                  <Search className="h-5 w-5 text-white" />
                </button>

                {/* Search Dropdown */}
                {isSearchOpen && (
                  <div className="absolute right-0 mt-2 w-96 bg-white border border-[#E5E5E5] rounded-lg shadow-lg">
                    <div className="p-4">
                      <Input
                        type="text"
                        placeholder="Buscar noticia por titulo, descripcion o categoria..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="bg-white border-[#E5E5E5] text-[#1A1A1A] placeholder:text-[#4A4A4A]"
                      />
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {searchResults.length > 0 ? (
                        searchResults.map((result) => (
                          <Link
                            key={result.$id}
                            to={`/posts/${result.$id}`}
                            className="flex items-center px-4 py-3 hover:bg-[#F5F5F5] border-t border-[#E5E5E5]"
                            onClick={() => {
                              setIsSearchOpen(false);
                              setSearchQuery("");
                            }}>
                            <div className="flex flex-col">
                              <span className="text-[#1A1A1A]">
                                {result.title}
                              </span>
                              <span className="text-xs text-[#4A4A4A]">
                                {result.location && `${result.location} • `}
                                {result.caption?.substring(0, 100)}
                                {result.caption?.length > 100 ? "..." : ""}
                              </span>
                            </div>
                          </Link>
                        ))
                      ) : searchQuery ? (
                        <div className="px-4 py-3 text-[#4A4A4A] text-center">
                          No se encontraron resultados
                        </div>
                      ) : null}
                    </div>
                  </div>
                )}
              </div>

              {/* Auth-dependent actions */}
              {isAuthenticated ? (
                <>
                  <Button
                    variant="ghost"
                    className="hover:bg-white/10 text-white hover:text-white/80"
                    onClick={() => signOut()}>
                    <img
                      src="/assets/icons/logout.svg"
                      alt="logout"
                      className="h-5 w-5 brightness-0 invert"
                    />
                  </Button>
                  <div className="flex items-center gap-3">
                    {isAdmin && (
                      <span className="px-2 py-1 text-xs font-medium bg-white/10 text-white rounded-full">
                        Admin
                      </span>
                    )}
                    <Link to={`/profile/${user.id}`} className="flex-center gap-3">
                      <img
                        src={
                          user.imageUrl || "/assets/icons/profile-placeholder.svg"
                        }
                        alt="profile"
                        className="h-8 w-8 rounded-full border-2 border-white"
                      />
                    </Link>
                  </div>
                </>
              ) : (
                /* Not authenticated - show only admin login */
                <div className="flex items-center space-x-2">
                  <Link to="/admin/login" className="hidden">
                    <Button size="sm" className="bg-white text-[#BB1919] hover:bg-white/90">
                      Acceso Admin
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Navigation - App Features and Categories */}
      <div className="bg-[#BB1919]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center justify-between w-full">
              {/* Navigation Items - Left Side */}
              <div className="flex items-center space-x-6">
                {/* Public navigation items - shown to all users */}
                {publicLinks.map((link) => (
                  <Link
                    key={link.label}
                    to={link.route}
                    className={cn(
                      "flex items-center space-x-2 text-sm font-medium transition-colors duration-200 rounded-lg px-4 py-2",
                      location.pathname === link.route
                        ? "bg-white text-[#BB1919]"
                        : "text-white hover:bg-white/10"
                    )}>
                    <img
                      src={link.imgURL}
                      alt={link.label}
                      className={cn(
                        "h-5 w-5",
                        location.pathname === link.route
                          ? "brightness-0"
                          : "brightness-0 invert"
                      )}
                    />
                    <span>{link.label}</span>
                  </Link>
                ))}

                {/* Admin user navigation items - only for admins */}
                {isAdmin &&
                  userLinks.map((link) => (
                    <Link
                      key={link.label}
                      to={link.route}
                      className={cn(
                        "flex items-center space-x-2 text-sm font-medium transition-colors duration-200 rounded-lg px-4 py-2",
                        location.pathname === link.route
                          ? "bg-white text-[#BB1919]"
                          : "text-white hover:bg-white/10"
                      )}>
                      <img
                        src={link.imgURL}
                        alt={link.label}
                        className={cn(
                          "h-5 w-5",
                          location.pathname === link.route
                            ? "brightness-0"
                            : "brightness-0 invert"
                        )}
                      />
                      <span>{link.label}</span>
                    </Link>
                  ))}

                {/* Admin navigation items - shown only to admin users */}
                {isAdmin &&
                  adminLinks.map((link) => (
                    <Link
                      key={link.label}
                      to={link.route}
                      className={cn(
                        "flex items-center space-x-2 text-sm font-medium transition-colors duration-200 rounded-lg px-4 py-2",
                        location.pathname === link.route
                          ? "bg-white text-[#BB1919]"
                          : "text-white hover:bg-white/10"
                      )}>
                      <img
                        src={link.imgURL}
                        alt={link.label}
                        className={cn(
                          "h-5 w-5",
                          location.pathname === link.route
                            ? "brightness-0"
                            : "brightness-0 invert"
                        )}
                      />
                      <span>{link.label}</span>
                    </Link>
                  ))}
              </div>

              {/* Category Links - Right Side */}
              <div className="flex items-center space-x-3 border-l border-white/20 pl-6">
                <Link
                  to="/"
                  className={cn(
                    "text-sm font-medium transition-colors duration-200 rounded-lg px-3 py-2",
                    !locationParam
                      ? "bg-white text-[#BB1919]"
                      : "text-white hover:bg-white/10"
                  )}>
                  Todas
                </Link>
                {locations.map((loc) => (
                  <Link
                    key={loc}
                    to={`/${loc}`}
                    className={cn(
                      "text-sm font-medium transition-colors duration-200 rounded-lg px-3 py-2",
                      locationParam === loc
                        ? "bg-white text-[#BB1919]"
                        : "text-white hover:bg-white/10"
                    )}>
                    {loc}
                  </Link>
                ))}
              </div>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 rounded-full hover:bg-white/10"
              onClick={() => setIsOpen(!isOpen)}>
              {isOpen ? (
                <X className="h-6 w-6 text-white" />
              ) : (
                <Menu className="h-6 w-6 text-white" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="md:hidden bg-[#BB1919] border-t border-white/20">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {/* Public navigation items - shown to all users */}
            {publicLinks.map((link) => (
              <Link
                key={link.label}
                to={link.route}
                className={cn(
                  "flex items-center space-x-2 text-sm font-medium transition-colors duration-200 rounded-lg px-4 py-2",
                  location.pathname === link.route
                    ? "bg-white text-[#BB1919]"
                    : "text-white hover:bg-white/10"
                )}
                onClick={() => setIsOpen(false)}>
                <img
                  src={link.imgURL}
                  alt={link.label}
                  className={cn(
                    "h-5 w-5 mr-2",
                    location.pathname === link.route
                      ? "brightness-0"
                      : "brightness-0 invert"
                  )}
                />
                {link.label}
              </Link>
            ))}

            {/* Category Links for Mobile */}
            <div className="border-t border-white/20 pt-2 mt-2">
              <div className="px-4 py-2 text-white/70 text-xs font-medium">
                CATEGORÍAS
              </div>
              <Link
                to="/"
                className={cn(
                  "block text-sm font-medium transition-colors duration-200 rounded-lg px-4 py-2",
                  !locationParam
                    ? "bg-white text-[#BB1919]"
                    : "text-white hover:bg-white/10"
                )}
                onClick={() => setIsOpen(false)}>
                Todas
              </Link>
              {locations.map((loc) => (
                <Link
                  key={loc}
                  to={`/${loc}`}
                  className={cn(
                    "block text-sm font-medium transition-colors duration-200 rounded-lg px-4 py-2",
                    locationParam === loc
                      ? "bg-white text-[#BB1919]"
                      : "text-white hover:bg-white/10"
                  )}
                  onClick={() => setIsOpen(false)}>
                  {loc}
                </Link>
              ))}
            </div>

            {/* Admin user navigation items - only for admins */}
            {isAdmin &&
              userLinks.map((link) => (
                <Link
                  key={link.label}
                  to={link.route}
                  className={cn(
                    "flex items-center space-x-2 text-sm font-medium transition-colors duration-200 rounded-lg px-4 py-2",
                    location.pathname === link.route
                      ? "bg-white text-[#BB1919]"
                      : "text-white hover:bg-white/10"
                  )}
                  onClick={() => setIsOpen(false)}>
                  <img
                    src={link.imgURL}
                    alt={link.label}
                    className={cn(
                      "h-5 w-5 mr-2",
                      location.pathname === link.route
                        ? "brightness-0"
                        : "brightness-0 invert"
                    )}
                  />
                  {link.label}
                </Link>
              ))}

            {/* Admin navigation items - shown only to admin users */}
            {isAdmin &&
              adminLinks.map((link) => (
                <Link
                  key={link.label}
                  to={link.route}
                  className={cn(
                    "flex items-center space-x-2 text-sm font-medium transition-colors duration-200 rounded-lg px-4 py-2",
                    location.pathname === link.route
                      ? "bg-white text-[#BB1919]"
                      : "text-white hover:bg-white/10"
                  )}
                  onClick={() => setIsOpen(false)}>
                  <img
                    src={link.imgURL}
                    alt={link.label}
                    className={cn(
                      "h-5 w-5 mr-2",
                      location.pathname === link.route
                        ? "brightness-0"
                        : "brightness-0 invert"
                    )}
                  />
                  {link.label}
                </Link>
              ))}

            {/* Mobile admin login section for non-authenticated users */}
            {!isAuthenticated && (
              <div className="border-t border-white/20 pt-2 mt-2 hidden">
                <Link
                  to="/admin/login"
                  className="flex items-center space-x-2 text-sm font-medium text-white hover:bg-white/10 rounded-lg px-4 py-2"
                  onClick={() => setIsOpen(false)}>
                  <span>Acceso Admin</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
