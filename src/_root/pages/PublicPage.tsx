import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const PublicPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-[#F8F8F8]">
      {/* Header público */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <img src="/assets/images/logo.svg" alt="BCS News" className="h-8 w-auto" />
              <span className="ml-2 text-xl font-bold text-[#1A1A1A]">BCS News</span>
            </div>
            
            <div className="flex items-center space-x-4">
              <Link to="/admin/login">
                <Button className="bg-[#BB1919] hover:bg-[#A51717] text-white">
                  Acceso Admin
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Contenido principal */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold text-[#1A1A1A] mb-6">
            Bienvenido a <span className="text-[#BB1919]">BCS News</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Tu plataforma de noticias y contenido. Mantente informado con las últimas noticias 
            sin necesidad de registrarte. Solo navega y explora.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/home">
              <Button size="lg" className="bg-[#BB1919] hover:bg-[#A51717] text-white px-8 py-3">
                Ver Noticias
              </Button>
            </Link>
            <Link to="#about">
              <Button size="lg" variant="outline" className="border-[#BB1919] text-[#BB1919] hover:bg-[#BB1919] hover:text-white px-8 py-3">
                Conocer Más
              </Button>
            </Link>
          </div>
        </div>

        {/* Features Section */}
        <div id="about" className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="text-center p-6 bg-white rounded-lg shadow-sm border">
            <div className="w-16 h-16 bg-[#BB1919]/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-[#BB1919]" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2 text-[#1A1A1A]">Noticias Verificadas</h3>
            <p className="text-gray-600">Contenido verificado y confiable de fuentes autorizadas.</p>
          </div>
          
          <div className="text-center p-6 bg-white rounded-lg shadow-sm border">
            <div className="w-16 h-16 bg-[#BB1919]/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-[#BB1919]" fill="currentColor" viewBox="0 0 20 20">
                <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2 text-[#1A1A1A]">Acceso Libre</h3>
            <p className="text-gray-600">Lee y explora todas las noticias sin necesidad de registro.</p>
          </div>
          
          <div className="text-center p-6 bg-white rounded-lg shadow-sm border">
            <div className="w-16 h-16 bg-[#BB1919]/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-[#BB1919]" fill="currentColor" viewBox="0 0 20 20">
                <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2 text-[#1A1A1A]">Fácil de Usar</h3>
            <p className="text-gray-600">Interfaz intuitiva para leer y compartir contenido.</p>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-[#BB1919] text-white rounded-lg p-8 text-center">
          <h2 className="text-3xl font-bold mb-4">¡Comienza a leer ahora!</h2>
          <p className="text-lg mb-6 opacity-90">
            Explora nuestra plataforma y mantente informado con las últimas noticias.
          </p>
          <Link to="/home">
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-[#BB1919] px-8 py-3">
              Explorar Noticias
            </Button>
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-[#1A1A1A] text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-4 md:mb-0">
              <img src="/assets/images/logo.svg" alt="BCS News" className="h-6 w-auto" />
              <span className="ml-2 text-lg font-semibold">BCS News</span>
            </div>
            <div className="text-sm text-gray-400">
              © 2024 BCS News. Todos los derechos reservados.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PublicPage; 