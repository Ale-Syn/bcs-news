import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useUserContext } from "@/context/AuthContext";

// Componente Card inline para evitar problemas de importación
const Card = ({ children, className = "", ...props }: { children: React.ReactNode; className?: string; [key: string]: any }) => (
  <div
    className={`rounded-lg border bg-white text-gray-900 shadow-sm ${className}`}
    {...props}
  >
    {children}
  </div>
);

const AdminDashboard = () => {
  const { user } = useUserContext();

  const adminStats = [
    { title: "Total Usuarios", value: "1,234", icon: "👥", change: "+12%" },
    { title: "Posts Publicados", value: "856", icon: "📝", change: "+8%" },
    { title: "Comentarios", value: "2,341", icon: "💬", change: "+15%" },
    { title: "Reportes Pendientes", value: "23", icon: "⚠️", change: "-5%" },
  ];

  const quickActions = [
    { title: "Gestionar Usuarios", desc: "Ver y administrar cuentas de usuario", link: "/all-users", icon: "👤" },
    { title: "Gestionar Categorías", desc: "Añadir y editar categorías de noticias", link: "/admin/categories", icon: "📂" },
    { title: "Moderar Contenido", desc: "Revisar posts y comentarios reportados", link: "/admin/content", icon: "🛡️" },
    { title: "Configuración", desc: "Ajustes generales del sistema", link: "/admin/settings", icon: "⚙️" },
    { title: "Analíticas", desc: "Ver estadísticas y reportes", link: "/admin/analytics", icon: "📊" },
  ];

  return (
    <div className="flex-1 h-full pt-20 p-6 bg-gray-50 overflow-y-auto">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-[#1A1A1A] mb-2">
                Panel de Administración
              </h1>
              <p className="text-gray-600">
                Bienvenido de vuelta, <span className="font-semibold text-[#BB1919]">{user.name}</span>
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="bg-[#BB1919] text-white px-4 py-2 rounded-full text-sm font-medium">
                👑 ADMINISTRADOR
              </div>
              <Link to="/">
                <Button variant="outline" className="border-[#BB1919] text-[#BB1919] hover:bg-[#BB1919] hover:text-white">
                  Ver Sitio Principal
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {adminStats.map((stat, index) => (
            <Card key={index} className="p-6 bg-white border-l-4 border-l-[#BB1919] hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
                  <p className="text-2xl font-bold text-[#1A1A1A]">{stat.value}</p>
                  <p className="text-sm text-green-600 font-medium">{stat.change}</p>
                </div>
                <div className="text-3xl">{stat.icon}</div>
              </div>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-[#1A1A1A] mb-4">Acciones Rápidas</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickActions.map((action, index) => (
              <Link key={index} to={action.link}>
                <Card className="p-6 bg-white hover:shadow-lg transition-all duration-200 hover:scale-105 cursor-pointer group border hover:border-[#BB1919]">
                  <div className="text-center">
                    <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">
                      {action.icon}
                    </div>
                    <h3 className="font-semibold text-[#1A1A1A] mb-2 group-hover:text-[#BB1919]">
                      {action.title}
                    </h3>
                    <p className="text-sm text-gray-600">{action.desc}</p>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Users */}
          <Card className="p-6 bg-white">
            <h3 className="text-lg font-semibold text-[#1A1A1A] mb-4">Usuarios Recientes</h3>
            <div className="space-y-3">
              {[1, 2, 3, 4].map((_, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-10 h-10 bg-[#BB1919] rounded-full flex items-center justify-center text-white font-semibold">
                    U{index + 1}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-[#1A1A1A]">Usuario {index + 1}</p>
                    <p className="text-sm text-gray-600">Se registró hace {index + 1} horas</p>
                  </div>
                  <div className="text-green-500 text-sm font-medium">Activo</div>
                </div>
              ))}
            </div>
          </Card>

          {/* Recent Reports */}
          <Card className="p-6 bg-white">
            <h3 className="text-lg font-semibold text-[#1A1A1A] mb-4">Reportes Recientes</h3>
            <div className="space-y-3">
              {[1, 2, 3, 4].map((_, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center text-white">
                    ⚠️
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-[#1A1A1A]">Contenido reportado #{index + 1}</p>
                    <p className="text-sm text-gray-600">Spam/Contenido inapropiado</p>
                  </div>
                  <Button size="sm" variant="outline" className="text-xs">
                    Revisar
                  </Button>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* System Status */}
        <Card className="mt-6 p-6 bg-white">
          <h3 className="text-lg font-semibold text-[#1A1A1A] mb-4">Estado del Sistema</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <div className="w-8 h-8 bg-green-500 rounded-full"></div>
              </div>
              <p className="font-medium text-[#1A1A1A]">Servidor</p>
              <p className="text-sm text-green-600">Operativo</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <div className="w-8 h-8 bg-green-500 rounded-full"></div>
              </div>
              <p className="font-medium text-[#1A1A1A]">Base de Datos</p>
              <p className="text-sm text-green-600">Operativa</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <div className="w-8 h-8 bg-yellow-500 rounded-full"></div>
              </div>
              <p className="font-medium text-[#1A1A1A]">CDN</p>
              <p className="text-sm text-yellow-600">Mantenimiento</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard; 