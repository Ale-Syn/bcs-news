import * as z from "zod";
import { Models } from "appwrite";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Button,
  Input,
  Select,
  Textarea,
} from "@/components/ui";
import { PostValidation } from "@/lib/validation";
import { useToast } from "@/components/ui/use-toast";
import { useUserContext } from "@/context/AuthContext";
import { FileUploader, Loader } from "@/components/shared";
import { useCreatePost, useUpdatePost, useGetCategories } from "@/lib/react-query/queries";

type PostFormProps = {
  post?: Models.Document;
  action: "Crear" | "Editar";
};

const PostForm = ({ post, action }: PostFormProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useUserContext();
  const form = useForm<z.infer<typeof PostValidation>>({
    resolver: zodResolver(PostValidation),
    defaultValues: {
      title: post ? post?.title : "",
      caption: post ? post?.caption : "",
      file: [],
      location: post ? post.location : "",
      tags: post ? post.tags.join(",") : "",
    },
  });

  // Query
  const { mutateAsync: createPost, isLoading: isLoadingCreate } =
    useCreatePost();
  const { mutateAsync: updatePost, isLoading: isLoadingUpdate } =
    useUpdatePost();
  const { data: categories, isLoading: isLoadingCategories } = useGetCategories();

  // Handler
  const handleSubmit = async (value: z.infer<typeof PostValidation>) => {
    // ACTION = UPDATE
    if (post && action === "Editar") {
      const updatedPost = await updatePost({
        ...value,
        postId: post.$id,
        imageId: post.imageId,
        imageUrl: post.imageUrl,
      });

      if (!updatedPost) {
        toast({
          title: `${action} post failed. Please try again.`,
          variant: "destructive",
        });
      } else {
        // Multiple scroll methods to ensure it works
        try {
          // Method 1: Window scroll
          window.scrollTo({ top: 0, behavior: 'smooth' });
          
          // Method 2: Document scroll
          document.documentElement.scrollTop = 0;
          document.body.scrollTop = 0;
          
          // Method 3: Find main container and scroll
          const mainContainer = document.querySelector('.common-container') || 
                               document.querySelector('.home-container') ||
                               document.querySelector('main') ||
                               document.body;
          if (mainContainer) {
            mainContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        } catch (error) {
          console.log('Scroll error:', error);
        }
        
        // Show success message
        toast({
          title: "¡Noticia actualizada exitosamente!",
          description: "Los cambios se han guardado correctamente.",
          variant: "default",
        });
        
        // Navigate to post details after a brief delay to show the toast
        setTimeout(() => {
          navigate(`/posts/${post.$id}`);
        }, 1500);
        return;
      }
    }

    // ACTION = CREATE
    const newPost = await createPost({
      ...value,
      userId: user.id,
    });

    if (!newPost) {
      toast({
        title: `${action} post failed. Please try again.`,
        variant: "destructive",
      });
    } else {
      // Multiple scroll methods to ensure it works
      try {
        // Method 1: Window scroll
        window.scrollTo({ top: 0, behavior: 'smooth' });
        
        // Method 2: Document scroll
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
        
        // Method 3: Find main container and scroll
        const mainContainer = document.querySelector('.common-container') || 
                             document.querySelector('.home-container') ||
                             document.querySelector('main') ||
                             document.body;
        if (mainContainer) {
          mainContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      } catch (error) {
        console.log('Scroll error:', error);
      }
      
      // Show success message
      toast({
        title: "¡Noticia creada exitosamente!",
        description: "La nueva noticia se ha publicado correctamente.",
        variant: "default",
      });
      
      // Navigate to home after a brief delay to show the toast
      setTimeout(() => {
        navigate("/");
      }, 1500);
      return;
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="flex flex-col gap-9 w-full">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="shad-form_label">Título</FormLabel>
              <FormControl>
                <Input
                  type="text"
                  className="shad-input"
                  placeholder="Título de la noticia..."
                  {...field}
                />
              </FormControl>
              <FormMessage className="shad-form_message" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="caption"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="shad-form_label">Descripcion</FormLabel>
              <FormControl>
                <Textarea
                  className="shad-textarea custom-scrollbar"
                  placeholder="Escribe tu noticia aquí..."
                  {...field}
                />
              </FormControl>
              <FormMessage className="shad-form_message" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="file"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="shad-form_label">Agregar Imagen</FormLabel>
              <FormControl>
                <FileUploader
                  fieldChange={field.onChange}
                  mediaUrl={post?.imageUrl}
                />
              </FormControl>
              <FormMessage className="shad-form_message" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="shad-form_label">Categoria</FormLabel>
              <FormControl>
                {isLoadingCategories ? (
                  <div className="flex items-center justify-center h-10">
                    <Loader />
                  </div>
                ) : (
                  <Select 
                    className="shad-input" 
                    {...field}
                  >
                    <option value="">Selecciona una categoría</option>
                    {categories?.documents.map((category: any) => (
                      <option key={category.$id} value={category.name}>
                        {category.name}
                      </option>
                    ))}
                  </Select>
                )}
              </FormControl>
              <FormMessage className="shad-form_message" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="tags"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="shad-form_label">
                Agregar Etiquetas (separadas por coma " , ")
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="Arte, Expresion, Aprender"
                  type="text"
                  className="shad-input"
                  {...field}
                />
              </FormControl>
              <FormMessage className="shad-form_message" />
            </FormItem>
          )}
        />

        <div className="flex gap-4 items-center justify-end">
          <Button
            type="button"
            className="shad-button_dark"
            onClick={() => navigate(-1)}>
            Cancelar
          </Button>
          <Button
            type="submit"
            className="shad-button_primary whitespace-nowrap"
            disabled={isLoadingCreate || isLoadingUpdate}>
            {(isLoadingCreate || isLoadingUpdate) && <Loader />}
            {action} Noticia
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default PostForm;
