# 🗂️ Sistema de Categorías Dinámicas - Configuración

## ✅ Cambios Implementados

### 1. **Configuración de Base de Datos**
- ✅ Agregada configuración para colección de categorías en `config.ts`
- ✅ Variable de entorno: `VITE_APPWRITE_CATEGORIES_COLLECTION_ID`

### 2. **API Functions**
- ✅ `createCategory()` - Crear nueva categoría
- ✅ `getCategories()` - Obtener todas las categorías
- ✅ `updateCategory()` - Actualizar categoría existente
- ✅ `deleteCategory()` - Eliminar categoría

### 3. **React Query Hooks**
- ✅ `useGetCategories()` - Hook para obtener categorías
- ✅ `useCreateCategory()` - Hook para crear categoría
- ✅ `useUpdateCategory()` - Hook para actualizar categoría
- ✅ `useDeleteCategory()` - Hook para eliminar categoría

### 4. **Componentes UI**
- ✅ Componente `Select` personalizado creado
- ✅ Exportado en `src/components/ui/index.ts`

### 5. **Páginas y Navegación**
- ✅ `CategoriesManagement.tsx` - Página de gestión de categorías
- ✅ Ruta agregada: `/admin/categories`
- ✅ Enlaces agregados en AdminDashboard y Navbar
- ✅ Protección para solo administradores

### 6. **PostForm Actualizado**
- ✅ Campo de categoría convertido de input a select
- ✅ Categorías cargadas dinámicamente desde la base de datos
- ✅ Loading state mientras se cargan categorías

## 🔧 Configuración Requerida

### Paso 1: Variable de Entorno
Necesitas agregar esta variable de entorno en tu configuración de Vercel/hosting:

```env
VITE_APPWRITE_CATEGORIES_COLLECTION_ID=tu_collection_id_aqui
```

### Paso 2: Crear Colección en Appwrite
Ve a tu dashboard de Appwrite y crea una nueva colección con estos campos:

**Nombre de la colección:** `categories`

**Campos requeridos:**
- `name` (String, requerido) - Nombre de la categoría
- `createdAt` (String) - Fecha de creación

**Permisos:**
- Read: `any` (para que todos puedan leer las categorías)
- Create/Update/Delete: Solo administradores

### Paso 3: Primeras Categorías (Opcional)
Una vez configurada la colección, puedes agregar algunas categorías iniciales desde `/admin/categories`:

**Categorías sugeridas para BCS:**
- Política
- Economía
- Deportes
- Cultura
- Tecnología
- Salud
- Educación
- Turismo
- Medio Ambiente
- Seguridad
- Local
- Regional

## 🎯 Funcionalidades Disponibles

### Para Administradores:
1. **Acceso a `/admin/categories`**
   - ➕ Crear nuevas categorías
   - ✏️ Editar categorías existentes
   - 🗑️ Eliminar categorías
   - 📋 Ver lista completa de categorías

2. **Validaciones:**
   - No permite categorías duplicadas
   - Nombres de categorías requeridos
   - Confirmación antes de eliminar

### Para Todos los Usuarios:
1. **Al crear/editar noticias:**
   - 📋 Select dropdown con categorías disponibles
   - 🔄 Carga dinámica desde la base de datos
   - ⚡ Loading state mientras cargan

## 📁 Archivos Modificados

```
src/
├── lib/
│   ├── appwrite/
│   │   ├── config.ts (+ categoriesCollectionId)
│   │   └── api.ts (+ funciones CRUD categorías)
│   └── react-query/
│       ├── queryKeys.ts (+ GET_CATEGORIES)
│       └── queries.ts (+ hooks de categorías)
├── components/
│   ├── ui/
│   │   ├── select.tsx (NUEVO)
│   │   └── index.ts (+ export select)
│   ├── forms/
│   │   └── PostForm.tsx (campo categoría → select dinámico)
│   └── shared/
│       └── Navbar.tsx (+ enlace categorías admin)
├── _root/
│   └── pages/
│       ├── CategoriesManagement.tsx (NUEVO)
│       ├── AdminDashboard.tsx (+ enlace categorías)
│       └── index.ts (+ export CategoriesManagement)
├── App.tsx (+ ruta /admin/categories)
└── constants/index.ts (- newsCategories hardcodeadas)
```

## 🚀 Resultado

Los usuarios ahora pueden:
- ✅ Crear categorías dinámicamente desde el panel de admin
- ✅ Usar un select profesional al crear noticias
- ✅ Mantener consistencia en las categorías
- ✅ Gestionar completamente las categorías sin código

¡El sistema está listo para usar una vez que configures la variable de entorno y crees la colección en Appwrite! 