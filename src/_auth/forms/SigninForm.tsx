import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Loader from "@/components/shared/Loader";
import { useToast } from "@/components/ui/use-toast";

import { SigninValidation } from "@/lib/validation";
import { useSignInAccount } from "@/lib/react-query/queries";
import { useUserContext } from "@/context/AuthContext";

const SigninForm = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { checkAuthUser, isLoading: isUserLoading } = useUserContext();

  // Query
  const { mutateAsync: signInAccount, isLoading } = useSignInAccount();

  const form = useForm<z.infer<typeof SigninValidation>>({
    resolver: zodResolver(SigninValidation),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const handleSignin = async (user: z.infer<typeof SigninValidation>) => {
    try {
      const session = await signInAccount(user);

      if (!session) {
        toast({ 
          title: "Error de inicio de sesión", 
          description: "Por favor, verifique sus credenciales e intente nuevamente.",
          variant: "destructive"
        });
        return;
      }

      const isLoggedIn = await checkAuthUser();

      if (isLoggedIn) {
        form.reset();
        navigate("/home");
      } else {
        toast({ 
          title: "Error de autorización", 
          description: "No tiene permisos para acceder al sistema.",
          variant: "destructive"
        });
        return;
      }
    } catch (error: any) {
      console.error("Error en login:", error);
      
      let errorMessage = "Error de inicio de sesión. Intente nuevamente.";
      
      if (error.message && error.message.includes("Acceso denegado")) {
        errorMessage = "Acceso denegado: Solo administradores autorizados pueden ingresar.";
      } else if (error.message && error.message.includes("Invalid credentials")) {
        errorMessage = "Credenciales incorrectas. Verifique su email y contraseña.";
      } else if (error.message && error.message.includes("User not found")) {
        errorMessage = "Usuario no encontrado en el sistema.";
      }

      toast({ 
        title: "Error de acceso", 
        description: errorMessage,
        variant: "destructive"
      });
    }
  };

  return (
    <Form {...form}>
      <div className="sm:w-420 flex-center flex-col">
        <img src="/assets/images/logo.svg" alt="logo" />

        <h2 className="h3-bold md:h2-bold pt-5 sm:pt-12 text-[#1A1A1A]">
          Iniciar sesión
        </h2>
        <p className="text-[#4A4A4A] small-medium md:base-regular mt-2">
          Bienvenido de nuevo! Por favor, ingrese sus datos.
        </p>
        <form
          onSubmit={form.handleSubmit(handleSignin)}
          className="flex flex-col gap-5 w-full mt-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="shad-form_label text-[#1A1A1A]">Correo electrónico</FormLabel>
                <FormControl>
                  <Input type="text" className="shad-input" {...field} />
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
                <FormLabel className="shad-form_label text-[#1A1A1A]">Contraseña</FormLabel>
                <FormControl>
                  <Input type="password" className="shad-input" {...field} />
                </FormControl>
                <FormMessage className="text-[#C70000]" />
              </FormItem>
            )}
          />

          <Button type="submit" className="shad-button_primary bg-[#BB1919] hover:bg-[#A51717]">
            {isLoading || isUserLoading ? (
              <div className="flex-center gap-2">
                <Loader /> Cargando...
              </div>
            ) : (
              "Iniciar sesión"
            )}
          </Button>

          <p className="text-small-regular text-[#4A4A4A] text-center mt-2">
            Solo para administradores autorizados.
          </p>
        </form>
      </div>
    </Form>
  );
};

export default SigninForm;
