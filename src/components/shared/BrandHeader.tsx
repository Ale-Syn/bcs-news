import { Link } from "react-router-dom";

const BrandHeader = () => {
  return (
    <div className="w-full bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between gap-4">
          <h1 className="h1-bold text-3xl md:text-5xl lg:text-6xl font-bold text-[#1A1A1A]">
            <Link to="/">ALTAVOZ BCS</Link>
          </h1>
          <div className="flex flex-col items-end gap-1 sm:gap-1.5">
            <div className="flex items-center gap-2">
              <a href="https://www.facebook.com/profile.php?id=61577335120064" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="p-2.5 rounded-full hover:bg-[#F3F4F6] transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6 text-[#1A1A1A]"><path d="M22 12.06C22 6.48 17.52 2 11.94 2 6.36 2 1.88 6.48 1.88 12.06c0 4.99 3.64 9.13 8.4 10v-7.07H7.93v-2.93h2.35V9.41c0-2.33 1.39-3.62 3.52-3.62 1.02 0 2.08.18 2.08.18v2.29h-1.17c-1.15 0-1.51.72-1.51 1.46v1.76h2.57l-.41 2.93h-2.16V22c4.76-.87 8.4-5.01 8.4-9.94Z"/></svg>
              </a>
              <a href="https://x.com/AltavozBCS" target="_blank" rel="noopener noreferrer" aria-label="X" className="p-2.5 rounded-full hover:bg-[#F3F4F6] transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6 text-[#1A1A1A]"><path d="M3 3h4.6l4.05 6.2L16.3 3H21l-7.5 9.6L21 21h-4.6l-4.32-6.6L7.7 21H3l7.9-9.9L3 3Z"/></svg>
              </a>
              <a href="https://www.instagram.com/altavoz_bcs/" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="p-2.5 rounded-full hover:bg-[#F3F4F6] transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6 text-[#1A1A1A]"><path d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5Zm0 2a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3H7Zm11 2a1 1 0 1 1 0 2 1 1 0 0 1 0-2ZM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10Z"/></svg>
              </a>
            </div>
            <div className="flex items-center text-xs sm:text-sm text-[#1A1A1A]">
              <span className="font-medium">Baja California Sur</span>
              <span className="text-[#9CA3AF] mx-2">•</span>
              <span className="capitalize">
                {new Date().toLocaleDateString('es-MX', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BrandHeader;


