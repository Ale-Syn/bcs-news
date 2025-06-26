# Configuración del Sistema de Orden de Posts

## 📋 Descripción

Esta nueva funcionalidad permite a los administradores reordenar las noticias arrastrándolas en la página principal. El orden establecido será visible para todos los usuarios visitantes.

## 🔧 Configuración Requerida

### 1. Variable de Entorno

Agregar en Vercel (o tu hosting):
```
VITE_APPWRITE_POST_ORDER_COLLECTION_ID=tu_collection_id_aqui
```

### 2. Crear Colección en Appwrite

En tu consola de Appwrite, crear una nueva colección con las siguientes características:

**Nombre:** `post_orders`
**ID:** El valor que usarás en la variable de entorno

**Atributos requeridos:**
- `orderType` (String, requerido) - Valores: "main" o "side"
- `postIds` (Array de Strings, requerido) - IDs de los posts en orden
- `createdAt` (DateTime, opcional)
- `updatedAt` (DateTime, opcional)

**Permisos:**
- **Create:** Solo administradores
- **Read:** Cualquier usuario (para que visitantes vean el orden)
- **Update:** Solo administradores
- **Delete:** Solo administradores

### 3. Configuración de Permisos en Appwrite

```javascript
// Permisos recomendados:
create: ["users.role:admin"]
read: ["any"]
update: ["users.role:admin"] 
delete: ["users.role:admin"]
```

## 🚀 Cómo Funciona

### Para Administradores:
1. Al arrastrar y soltar noticias en la página principal, el orden se guarda automáticamente
2. El cambio es visible inmediatamente para todos los usuarios
3. Se muestra una indicación visual de que el reordenamiento está disponible

### Para Usuarios Visitantes:
1. Ven las noticias en el orden establecido por el administrador
2. No pueden reordenar (funcionalidad bloqueada)
3. Si no hay orden establecido, ven las noticias por fecha de creación

## 🔍 Funcionalidades Implementadas

- ✅ Drag & Drop solo para administradores
- ✅ Persistencia en base de datos
- ✅ Fallback a orden por fecha si no hay orden personalizado
- ✅ Manejo de posts nuevos (se agregan al final)
- ✅ Manejo de posts eliminados (se filtran automáticamente)
- ✅ Indicadores visuales para administradores
- ✅ Separación entre orden principal y lateral

## 📱 Secciones Afectadas

1. **Noticias Principales** (`orderType: "main"`)
   - Sección "Más Noticias" en la página principal
   
2. **Noticias Laterales** (`orderType: "side"`)
   - Sección "Noticias Destacadas" en la sidebar

## ⚠️ Notas Importantes

- La funcionalidad solo funciona si la variable de entorno está configurada
- Sin la configuración, el sistema usa el comportamiento original (orden por fecha)
- Los cambios son globales y afectan a todos los usuarios
- El localStorage se usa como cache local para administradores

## 🐛 Troubleshooting

**Problema:** Los cambios no se guardan
- **Solución:** Verificar que la variable de entorno esté configurada correctamente

**Problema:** Los usuarios visitantes no ven el orden
- **Solución:** Verificar los permisos de lectura en la colección de Appwrite

**Problema:** Error al arrastrar
- **Solución:** Verificar que el usuario tenga rol de ADMIN 