import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { Loader } from "@/components/shared";
import { useGetCategories, useCreateCategory, useUpdateCategory, useDeleteCategory } from "@/lib/react-query/queries";
import { Models } from "appwrite";

const CategoriesManagement = () => {
  const [newCategoryName, setNewCategoryName] = useState("");
  const [editingCategory, setEditingCategory] = useState<Models.Document | null>(null);
  const [editingName, setEditingName] = useState("");
  const { toast } = useToast();

  const { data: categories, isLoading } = useGetCategories();
  const { mutateAsync: createCategory, isLoading: isCreating } = useCreateCategory();
  const { mutateAsync: updateCategory, isLoading: isUpdating } = useUpdateCategory();
  const { mutateAsync: deleteCategory, isLoading: isDeleting } = useDeleteCategory();

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) {
      toast({
        title: "Error",
        description: "El nombre de la categoría es requerido",
        variant: "destructive",
      });
      return;
    }

    // Check if category already exists
    const categoryExists = categories?.documents.some(
      (cat: Models.Document) => cat.name.toLowerCase() === newCategoryName.toLowerCase()
    );

    if (categoryExists) {
      toast({
        title: "Error",
        description: "Esta categoría ya existe",
        variant: "destructive",
      });
      return;
    }

    try {
      await createCategory(newCategoryName);
      setNewCategoryName("");
      toast({
        title: "Éxito",
        description: "Categoría creada exitosamente",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo crear la categoría",
        variant: "destructive",
      });
    }
  };

  const handleEditCategory = (category: Models.Document) => {
    setEditingCategory(category);
    setEditingName(category.name);
  };

  const handleUpdateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory || !editingName.trim()) return;

    // Check if category name already exists (excluding current)
    const categoryExists = categories?.documents.some(
      (cat: Models.Document) => 
        cat.name.toLowerCase() === editingName.toLowerCase() && 
        cat.$id !== editingCategory.$id
    );

    if (categoryExists) {
      toast({
        title: "Error",
        description: "Esta categoría ya existe",
        variant: "destructive",
      });
      return;
    }

    try {
      await updateCategory({ categoryId: editingCategory.$id, name: editingName });
      setEditingCategory(null);
      setEditingName("");
      toast({
        title: "Éxito",
        description: "Categoría actualizada exitosamente",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo actualizar la categoría",
        variant: "destructive",
      });
    }
  };

  const handleDeleteCategory = async (categoryId: string, categoryName: string) => {
    if (window.confirm(`¿Estás seguro de que quieres eliminar la categoría "${categoryName}"?`)) {
      try {
        await deleteCategory(categoryId);
        toast({
          title: "Éxito",
          description: "Categoría eliminada exitosamente",
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "No se pudo eliminar la categoría",
          variant: "destructive",
        });
      }
    }
  };

  const cancelEdit = () => {
    setEditingCategory(null);
    setEditingName("");
  };

  if (isLoading) {
    return (
      <div className="flex-center w-full h-full">
        <Loader />
      </div>
    );
  }

  return (
    <div className="flex-1 h-full pt-20 p-6 bg-gray-50 overflow-y-auto">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#1A1A1A] mb-2">
            Gestión de Categorías
          </h1>
          <p className="text-gray-600">
            Administra las categorías disponibles para las noticias
          </p>
        </div>

        {/* Add New Category Form */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <h2 className="text-xl font-semibold text-[#1A1A1A] mb-4">
            Añadir Nueva Categoría
          </h2>
          <form onSubmit={handleCreateCategory} className="flex gap-4">
            <Input
              type="text"
              placeholder="Nombre de la categoría"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              className="flex-1"
              disabled={isCreating}
            />
            <Button 
              type="submit" 
              disabled={isCreating || !newCategoryName.trim()}
              className="bg-[#BB1919] hover:bg-[#A01717] text-white"
            >
              {isCreating ? <Loader /> : "Añadir"}
            </Button>
          </form>
        </div>

        {/* Categories List */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold text-[#1A1A1A]">
              Categorías Existentes ({categories?.documents.length || 0})
            </h2>
          </div>
          
          {!categories?.documents.length ? (
            <div className="p-8 text-center text-gray-500">
              No hay categorías creadas aún. Añade la primera categoría arriba.
            </div>
          ) : (
            <div className="divide-y">
              {categories.documents.map((category: Models.Document) => (
                <div key={category.$id} className="p-4 flex items-center justify-between">
                  {editingCategory?.$id === category.$id ? (
                    <form onSubmit={handleUpdateCategory} className="flex items-center gap-3 flex-1">
                      <Input
                        type="text"
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        className="flex-1"
                        disabled={isUpdating}
                      />
                      <Button 
                        type="submit" 
                        size="sm"
                        disabled={isUpdating || !editingName.trim()}
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        {isUpdating ? <Loader /> : "Guardar"}
                      </Button>
                      <Button 
                        type="button" 
                        size="sm" 
                        variant="outline"
                        onClick={cancelEdit}
                        disabled={isUpdating}
                      >
                        Cancelar
                      </Button>
                    </form>
                  ) : (
                    <>
                      <div className="flex-1">
                        <span className="text-[#1A1A1A] font-medium">{category.name}</span>
                        <p className="text-sm text-gray-500">
                          Creada: {new Date(category.createdAt).toLocaleDateString('es-ES')}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditCategory(category)}
                          disabled={isDeleting}
                          className="text-blue-600 border-blue-600 hover:bg-blue-50"
                        >
                          Editar
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteCategory(category.$id, category.name)}
                          disabled={isDeleting}
                          className="text-red-600 border-red-600 hover:bg-red-50"
                        >
                          {isDeleting ? <Loader /> : "Eliminar"}
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Info Section */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">
                Información importante
              </h3>
              <div className="mt-2 text-sm text-blue-700">
                <ul className="list-disc list-inside space-y-1">
                  <li>Las categorías se usarán en el formulario de crear noticias</li>
                  <li>Al eliminar una categoría, las noticias existentes conservarán su categoría</li>
                  <li>Los nombres de categorías no pueden repetirse</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoriesManagement; 