import { Routes, Route } from "react-router-dom";

import {
  Home,
  Explore,
  Saved,
  CreatePost,
  Profile,
  EditPost,
  PostDetails,
  UpdateProfile,
  AllUsers,
  Location,
  AdminSetup,
  PublicPage,
  AdminDashboard,
} from "@/_root/pages";
import AuthLayout from "./_auth/AuthLayout";
import RootLayout from "./_root/RootLayout";
import SigninForm from "@/_auth/forms/SigninForm";
import AdminLoginForm from "@/_auth/forms/AdminLoginForm";
import { Toaster } from "@/components/ui/toaster";
import ProtectedRoute from "@/components/shared/ProtectedRoute";

import "./globals.css";

const App = () => {
  return (
    <main className="flex h-screen">
      <Routes>
        {/* Rutas de autenticación */}
        <Route element={<AuthLayout />}>
          <Route path="/sign-in" element={<SigninForm />} />
        </Route>

        {/* Login específico para ADMIN */}
        <Route path="/admin/login" element={<AdminLoginForm />} />

        {/* Rutas públicas y privadas */}
        <Route element={<RootLayout />}>
          {/* Panel de administración - solo ADMIN */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          {/* Admin setup - ruta temporal */}
          <Route
            path="/admin-setup"
            element={
              <ProtectedRoute>
                <AdminSetup />
              </ProtectedRoute>
            }
          />

          {/* Rutas principales - PÚBLICAS */}
          <Route path="/" element={<Home />} />
          <Route path="/home" element={<Home />} />
          <Route path="/home/:location" element={<Home />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/posts/:id" element={<PostDetails />} />
          <Route path="/location/:location" element={<Location />} />
          <Route path="/profile/:id/*" element={<Profile />} />

          {/* Rutas que requieren autenticación */}
          <Route
            path="/saved"
            element={
              <ProtectedRoute>
                <Saved />
              </ProtectedRoute>
            }
          />
          <Route
            path="/create-post"
            element={
              <ProtectedRoute>
                <CreatePost />
              </ProtectedRoute>
            }
          />
          <Route
            path="/update-post/:id"
            element={
              <ProtectedRoute>
                <EditPost />
              </ProtectedRoute>
            }
          />
          <Route
            path="/update-profile/:id"
            element={
              <ProtectedRoute>
                <UpdateProfile />
              </ProtectedRoute>
            }
          />

          {/* Rutas de administración - solo ADMIN */}
          <Route
            path="/all-users"
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <AllUsers />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/settings"
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <div className="flex-1 pt-20 p-6 bg-gray-50">
                  <h1 className="text-2xl font-bold text-[#1A1A1A] mb-4">Configuración del Sistema</h1>
                  <p className="text-gray-600">Panel de configuración en desarrollo...</p>
                </div>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/content"
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <div className="flex-1 pt-20 p-6 bg-gray-50">
                  <h1 className="text-2xl font-bold text-[#1A1A1A] mb-4">Gestión de Contenido</h1>
                  <p className="text-gray-600">Panel de moderación en desarrollo...</p>
                </div>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/analytics"
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <div className="flex-1 pt-20 p-6 bg-gray-50">
                  <h1 className="text-2xl font-bold text-[#1A1A1A] mb-4">Analíticas</h1>
                  <p className="text-gray-600">Panel de analíticas en desarrollo...</p>
                </div>
              </ProtectedRoute>
            }
          />

          {/* Página de información (opcional) */}
          <Route path="/about" element={<PublicPage />} />
        </Route>
      </Routes>

      <Toaster />
    </main>
  );
};

export default App;
