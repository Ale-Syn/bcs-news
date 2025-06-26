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

  const recentActivities = [
    { action: "Usuario registrado", user: "María González", time: "Hace 5 min", icon: "👤" },
    { action: "Post publicado", user: "Carlos Ruiz", time: "Hace 15 min", icon: "📝" },
    { action: "Comentario reportado", user: "Ana López", time: "Hace 30 min", icon: "⚠️" },
    { action: "Post editado", user: "Luis Martinez", time: "Hace 1 hora", icon: "✏️" },
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

        {/* Nueva funcionalidad - Orden de Posts */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h3 className="text-lg font-semibold text-blue-800 mb-2">🎯 Nueva Funcionalidad: Orden de Noticias</h3>
          <p className="text-blue-700 mb-3">
            Ahora puedes reordenar las noticias arrastrándolas en la página principal. El orden que establescas será visible para todos los usuarios visitantes.
          </p>
          <div className="bg-blue-100 p-3 rounded border-l-4 border-blue-500">
            <p className="text-sm text-blue-800 font-medium mb-2">📋 Configuración requerida:</p>
            <p className="text-sm text-blue-700">
              Para activar esta funcionalidad, necesitas agregar la variable de entorno:
              <code className="bg-white px-2 py-1 rounded mx-1 text-blue-900">VITE_APPWRITE_POST_ORDER_COLLECTION_ID</code>
              en tu dashboard de Vercel y crear la colección correspondiente en Appwrite.
            </p>
          </div>
          <div className="mt-3">
            <Link 
              to="/" 
              className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium"
            >
              Ir a la página principal para probar →
            </Link>
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

          {/* Recent Activities */}
          <Card className="p-6 bg-white">
            <h3 className="text-lg font-semibold text-[#1A1A1A] mb-4">Actividades Recientes</h3>
            <div className="space-y-3">
              {recentActivities.map((activity, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-10 h-10 bg-[#BB1919] rounded-full flex items-center justify-center text-white">
                    {activity.icon}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-[#1A1A1A]">{activity.action}</p>
                    <p className="text-sm text-gray-600">{activity.user} • {activity.time}</p>
                  </div>
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