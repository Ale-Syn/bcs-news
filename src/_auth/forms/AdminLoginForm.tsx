import * as z from "zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Loader from "@/components/shared/Loader";
import { useToast } from "@/components/ui/use-toast";

import { SigninValidation } from "@/lib/validation";
import { useSignInAccount } from "@/lib/react-query/queries";
import { useUserContext } from "@/context/AuthContext";

const AdminLoginForm = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { checkAuthUser, isLoading: isUserLoading } = useUserContext();
  const [showPassword, setShowPassword] = useState(false);

  // Query
  const { mutateAsync: signInAccount, isLoading } = useSignInAccount();

  const form = useForm<z.infer<typeof SigninValidation>>({
    resolver: zodResolver(SigninValidation),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const handleAdminSignin = async (user: z.infer<typeof SigninValidation>) => {
    const session = await signInAccount(user);

    if (!session) {
      toast({ 
        title: "Error de acceso", 
        description: "Credenciales incorrectas. Verifique sus datos de administrador.",
        variant: "destructive"
      });
      return;
    }

    const isLoggedIn = await checkAuthUser();

    if (isLoggedIn) {
      // Verificar que el usuario sea ADMIN
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      if (currentUser.role !== 'ADMIN') {
        toast({ 
          title: "Acceso denegado", 
          description: "Esta área está restringida solo para administradores.",
          variant: "destructive"
        });
        // Logout del usuario no-admin
        localStorage.removeItem('cookieFallback');
        localStorage.removeItem('user');
        navigate("/public");
        return;
      }

      form.reset();
      toast({ 
        title: "Bienvenido, Administrador", 
        description: "Acceso concedido al panel de administración.",
      });
      navigate("/admin/dashboard");
    } else {
      toast({ 
        title: "Error de autenticación", 
        description: "No se pudo verificar las credenciales. Intente nuevamente.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-[#1A1A1A] via-gray-900 to-black flex items-center justify-center">
      <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header de Admin */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 bg-[#BB1919] rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Panel de Administración</h1>
          <p className="text-gray-400">Acceso restringido solo para administradores</p>
        </div>

        {/* Formulario */}
        <Form {...form}>
          <div className="bg-white rounded-lg shadow-xl p-8 max-w-md mx-auto">
            <form
              onSubmit={form.handleSubmit(handleAdminSignin)}
              className="flex flex-col gap-6">
              
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[#1A1A1A] font-semibold">Correo de Administrador</FormLabel>
                    <FormControl>
                      <Input 
                        type="email" 
                        placeholder="admin@bcs-news.com"
                        className="shad-input border-2 focus:border-[#BB1919]" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage className="text-[#C70000]" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[#1A1A1A] font-semibold">Contraseña de Administrador</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input 
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          className="shad-input border-2 focus:border-[#BB1919] pr-10" 
                          {...field} 
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4 text-gray-500" />
                          ) : (
                            <Eye className="h-4 w-4 text-gray-500" />
                          )}
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage className="text-[#C70000]" />
                  </FormItem>
                )}
              />

              <Button 
                type="submit" 
                className="w-full bg-[#BB1919] hover:bg-[#A51717] text-white py-3 font-semibold"
                disabled={isLoading || isUserLoading}
              >
                {isLoading || isUserLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <Loader /> Verificando acceso...
                  </div>
                ) : (
                  <>
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 2L3 7v11a1 1 0 001 1h3v-7h6v7h3a1 1 0 001-1V7l-7-5z" />
                    </svg>
                    Acceder como Administrador
                  </>
                )}
              </Button>

              {/* Divider */}
              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">o</span>
                </div>
              </div>

              {/* Links */}
              <div className="text-center space-y-2">
                <Link
                  to="/"
                  className="text-[#BB1919] hover:text-[#A51717] text-sm block">
                  Volver a la página pública
                </Link>
              </div>
            </form>
          </div>
        </Form>

        {/* Warning */}
        <div className="mt-6 bg-yellow-900/30 border border-yellow-600/50 rounded-lg p-4 max-w-md mx-auto">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-yellow-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <p className="text-yellow-300 text-sm">
              Área de acceso restringido. Solo personal autorizado.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLoginForm; 