import { ID, Query } from "appwrite";

import { appwriteConfig, account, databases, storage, avatars } from "./config";
import { IUpdatePost, INewPost, INewUser, IUpdateUser } from "@/types";

// ============================================================
// AUTH
// ============================================================

// ============================== SIGN UP
export async function createUserAccount(user: INewUser) {
  try {
    const newAccount = await account.create(
      ID.unique(),
      user.email,
      user.password,
      user.name
    );

    if (!newAccount) throw Error;

    const avatarUrl = avatars.getInitials(user.name);

    const newUser = await saveUserToDB({
      accountId: newAccount.$id,
      name: newAccount.name,
      email: newAccount.email,
      username: user.username,
      imageUrl: (avatarUrl as any)?.toString?.() ?? String(avatarUrl),
    });

    return newUser;
  } catch (error) {
    console.log(error);
    return error;
  }
}

// ============================== SAVE USER TO DB
export async function saveUserToDB(user: {
  accountId: string;
  email: string;
  name: string;
  imageUrl: string;
  username?: string;
}) {
  try {
    const newUser = await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      ID.unique(),
      user
    );

    return newUser;
  } catch (error) {
    console.log(error);
  }
}

// ============================== SIGN IN
export async function signInAccount(user: { email: string; password: string }) {
  try {
    // Primero cerrar cualquier sesión existente
    try {
      await account.deleteSession("current");
    } catch (error) {
      // Ignorar error si no hay sesión activa
      console.log("No hay sesión activa para cerrar");
    }

    // Verificar si el usuario existe en la base de datos y tiene rol ADMIN
    const adminUsers = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      [
        Query.equal("email", user.email),
        Query.equal("role", "ADMIN")
      ]
    );

    if (!adminUsers.documents || adminUsers.documents.length === 0) {
      throw new Error("Acceso denegado: Usuario no autorizado o no es administrador");
    }

    // Si el usuario tiene rol ADMIN, proceder con el login
    const session = await account.createEmailSession(user.email, user.password);

    return session;
  } catch (error) {
    console.log(error);
    throw error;
  }
}

// ============================== GET ACCOUNT
export async function getAccount() {
  try {
    const currentAccount = await account.get();

    return currentAccount;
  } catch (error: any) {
    // Si el error es 401 (Unauthorized), significa que no hay sesión activa
    // Esto es esperado cuando el usuario no está autenticado
    if (error?.code === 401 || error?.status === 401) {
      console.log("No hay sesión activa");
      return null;
    }
    
    console.log("Error obteniendo cuenta:", error);
    return null;
  }
}

// ============================== GET USER
export async function getCurrentUser() {
  try {
    const currentAccount = await getAccount();

    if (!currentAccount) throw Error;

    const currentUser = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      [Query.equal("accountId", currentAccount.$id)]
    );

    if (!currentUser) throw Error;

    const user = currentUser.documents[0];
    
    // Verificar que el usuario tenga rol ADMIN
    if (!user.role || user.role.toUpperCase() !== "ADMIN") {
      // Si no es admin, cerrar la sesión automáticamente
      await signOutAccount();
      throw new Error("Acceso denegado: Solo administradores pueden acceder");
    }

    return user;
  } catch (error) {
    console.log(error);
    return null;
  }
}

// ============================== SIGN OUT
export async function signOutAccount() {
  try {
    const session = await account.deleteSession("current");

    return session;
  } catch (error) {
    console.log(error);
  }
}

// ============================== GET ADMIN USERS
export async function getAdminUsers() {
  try {
    const adminUsers = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      [Query.equal("role", "ADMIN")]
    );

    return adminUsers.documents;
  } catch (error) {
    console.log(error);
    return [];
  }
}

// ============================== VERIFY ADMIN USER BY EMAIL
export async function verifyAdminUserByEmail(email: string) {
  try {
    const adminUser = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      [
        Query.equal("email", email),
        Query.equal("role", "ADMIN")
      ]
    );

    return adminUser.documents.length > 0 ? adminUser.documents[0] : null;
  } catch (error) {
    console.log(error);
    return null;
  }
}

// ============================== CLEAR ALL SESSIONS
export async function clearAllSessions() {
  try {
    // Intentar cerrar sesión actual
    await account.deleteSession("current");
  } catch (error) {
    console.log("No hay sesión activa para cerrar");
  }
  
  try {
    // Limpiar localStorage
    localStorage.removeItem('cookieFallback');
    localStorage.removeItem('user');
  } catch (error) {
    console.log("Error limpiando localStorage");
  }
}

// ============================================================
// POSTS
// ============================================================

// ============================== CREATE POST
export async function createPost(post: INewPost) {
  try {
    // Validación defensiva: requerir imagen
    if (!post.file || post.file.length === 0) {
      throw new Error("IMAGE_REQUIRED");
    }
    // Upload file to appwrite storage
    const uploadedFile = await uploadFile(post.file[0]);

    if (!uploadedFile) throw Error;

    // Get file url
    const fileUrl: string = getFilePreview(uploadedFile.$id);
    if (!fileUrl) {
      await deleteFile(uploadedFile.$id);
      throw Error;
    }

    // Convertir tags en array y limpiar vacíos
    const tags = (post.tags?.replace(/ /g, "").split(",").filter(Boolean)) || [];

    // Construir payload evitando atributos desconocidos
    const docData: any = {
      creator: post.userId,
      title: post.title,
      caption: post.caption,
      imageUrl: fileUrl,
      imageId: uploadedFile.$id,
      location: post.location,
      tags: tags,
    };
    if (post.isFeaturedSide) docData.isFeaturedSide = true;

    // Create post
    const newPost = await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      ID.unique(),
      docData
    );

    if (!newPost) {
      await deleteFile(uploadedFile.$id);
      throw Error;
    }

    return newPost;
  } catch (error) {
    console.log(error);
  }
}

// ============================== UPLOAD FILE
export async function uploadFile(file: File) {
  try {
    const uploadedFile = await storage.createFile(
      appwriteConfig.storageId,
      ID.unique(),
      file
    );

    return uploadedFile;
  } catch (error) {
    console.log(error);
  }
}

// ============================== GET FILE URL
export function getFilePreview(fileId: string): string {
  try {
    const fileUrl = storage.getFileView(
      appwriteConfig.storageId,
      fileId,
      //2000,
      //2000,
      //"top",
      //100
    );

    if (!fileUrl) throw Error;

    // Asegurar string plano
    return typeof fileUrl === "string" ? fileUrl : (fileUrl as any).toString();
  } catch (error) {
    console.log(error);
    return "";
  }
}

// ============================== DELETE FILE
export async function deleteFile(fileId: string) {
  try {
    await storage.deleteFile(appwriteConfig.storageId, fileId);

    return { status: "ok" };
  } catch (error) {
    console.log(error);
  }
}

// ============================== GET POSTS
export async function searchPosts(searchTerm: string) {
  try {
    const posts = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      [Query.search("caption", searchTerm)]
    );

    if (!posts) throw Error;

    return posts;
  } catch (error) {
    console.log(error);
  }
}

export async function getInfinitePosts({ pageParam }: { pageParam: number }) {
  const queries: any[] = [Query.orderDesc("$updatedAt"), Query.limit(9)];

  if (pageParam) {
    queries.push(Query.cursorAfter(pageParam.toString()));
  }

  try {
    const posts = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      queries
    );

    if (!posts) throw Error;

    return posts;
  } catch (error) {
    console.log(error);
  }
}

// ============================== GET POST BY ID
export async function getPostById(postId?: string) {
  if (!postId) throw Error;

  try {
    const post = await databases.getDocument(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      postId
    );

    if (!post) throw Error;

    return post;
  } catch (error) {
    console.log(error);
  }
}

// ============================== UPDATE POST
export async function updatePost(post: IUpdatePost) {
  const hasFileToUpdate = post.file.length > 0;

  try {
    let image = {
      imageUrl: post.imageUrl,
      imageId: post.imageId,
    };

    if (hasFileToUpdate) {
      // Upload new file to appwrite storage
      const uploadedFile = await uploadFile(post.file[0]);
      if (!uploadedFile) throw Error;

      // Get new file url
      const fileUrl: string = getFilePreview(uploadedFile.$id);
      if (!fileUrl) {
        await deleteFile(uploadedFile.$id);
        throw Error;
      }

      image = { ...image, imageUrl: fileUrl, imageId: uploadedFile.$id };
    }

    // Convert tags into array
    const tags = post.tags?.replace(/ /g, "").split(",") || [];

    //  Update post
    const updatedPost = await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      post.postId,
      {
        title: post.title,
        caption: post.caption,
        imageUrl: image.imageUrl,
        imageId: image.imageId,
        location: post.location,
        tags: tags,
        isFeaturedSide: Boolean(post.isFeaturedSide) || false,
      }
    );

    // Failed to update
    if (!updatedPost) {
      // Delete new file that has been recently uploaded
      if (hasFileToUpdate) {
        await deleteFile(image.imageId);
      }

      // If no new file uploaded, just throw error
      throw Error;
    }

    // Safely delete old file after successful update
    if (hasFileToUpdate) {
      await deleteFile(post.imageId);
    }

    return updatedPost;
  } catch (error) {
    console.log(error);
  }
}

// ============================== DELETE POST
export async function deletePost(postId?: string, imageId?: string) {
  if (!postId || !imageId) return;

  try {
    const statusCode = await databases.deleteDocument(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      postId
    );

    if (!statusCode) throw Error;

    await deleteFile(imageId);

    return { status: "Ok" };
  } catch (error) {
    console.log(error);
  }
}

// ============================== LIKE / UNLIKE POST
export async function likePost(postId: string, likesArray: string[]) {
  try {
    const updatedPost = await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      postId,
      {
        likes: likesArray,
      }
    );

    if (!updatedPost) throw Error;

    return updatedPost;
  } catch (error) {
    console.log(error);
  }
}

// ============================== SAVE POST
export async function savePost(userId: string, postId: string) {
  try {
    const updatedPost = await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.savesCollectionId,
      ID.unique(),
      {
        user: userId,
        post: postId,
      }
    );

    if (!updatedPost) throw Error;

    return updatedPost;
  } catch (error) {
    console.log(error);
  }
}
// ============================== DELETE SAVED POST
export async function deleteSavedPost(savedRecordId: string) {
  try {
    const statusCode = await databases.deleteDocument(
      appwriteConfig.databaseId,
      appwriteConfig.savesCollectionId,
      savedRecordId
    );

    if (!statusCode) throw Error;

    return { status: "Ok" };
  } catch (error) {
    console.log(error);
  }
}

// ============================================================
// ADS (BANNERS)
// ============================================================

type AdBannerPayload = {
  position: "top" | "bottom" | "sidebar";
  imageUrl: string;
  imageId?: string;
  linkUrl?: string;
  alt?: string;
};

// ============================== GET AD BANNER BY POSITION
export async function getAdBanner(position: "top" | "bottom" | "sidebar") {
  try {
    const ads = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.adsCollectionId,
      [Query.equal("position", position), Query.orderDesc("$updatedAt"), Query.limit(1)]
    );

    if (!ads || ads.documents.length === 0) return null;
    return ads.documents[0];
  } catch (error) {
    console.log(error);
    return null;
  }
}

// ============================== SAVE/UPSERT AD BANNER
export async function saveAdBanner(payload: AdBannerPayload, file?: File) {
  try {
    let imageUrl = payload.imageUrl;
    let imageId = payload.imageId;

    if (file) {
      const uploaded = await uploadFile(file);
      if (!uploaded) throw Error;
      imageUrl = getFilePreview(uploaded.$id) as any;
      imageId = uploaded.$id;
    }

    // Buscar existente por posición
    const existing = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.adsCollectionId,
      [Query.equal("position", payload.position), Query.limit(1)]
    );

    if (existing.documents.length > 0) {
      const updated = await databases.updateDocument(
        appwriteConfig.databaseId,
        appwriteConfig.adsCollectionId,
        existing.documents[0].$id,
        {
          position: payload.position,
          imageUrl,
          imageId,
          linkUrl: payload.linkUrl || "",
          alt: payload.alt || "",
          updatedAt: new Date(),
        }
      );
      return updated;
    }

    const created = await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.adsCollectionId,
      ID.unique(),
      {
        position: payload.position,
        imageUrl,
        imageId,
        linkUrl: payload.linkUrl || "",
        alt: payload.alt || "",
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    );
    return created;
  } catch (error) {
    console.log(error);
    return null;
  }
}

// ============================== GET USER'S POST
export async function getUserPosts(userId?: string) {
  if (!userId) return;

  try {
    const post = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      [Query.equal("creator", userId), Query.orderDesc("$createdAt")]
    );

    if (!post) throw Error;

    return post;
  } catch (error) {
    console.log(error);
  }
}

// ============================== GET POPULAR POSTS (BY HIGHEST LIKE COUNT)
export async function getRecentPosts() {
  try {
    const posts = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      [Query.orderDesc("$createdAt"), Query.limit(20)]
    );

    if (!posts) throw Error;

    return posts;
  } catch (error) {
    console.log(error);
  }
}

// ============================== GET ALL POSTS (no limit for admins)
export async function getAllPosts() {
  try {
    const pageSize = 100; // Appwrite máximo 100 por solicitud
    let hasMore = true;
    let lastId: string | undefined = undefined;
    const allDocuments: any[] = [];

    while (hasMore) {
      const queries: any[] = [Query.orderDesc("$createdAt"), Query.limit(pageSize)];
      if (lastId) {
        queries.push(Query.cursorAfter(lastId));
      }

      const page = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.postCollectionId,
        queries
      );

      const docs = page?.documents || [];
      allDocuments.push(...docs);

      if (!docs.length || docs.length < pageSize) {
        hasMore = false;
      } else {
        lastId = docs[docs.length - 1].$id;
      }
    }

    return { documents: allDocuments, total: allDocuments.length } as any;
  } catch (error) {
    console.log(error);
    return { documents: [], total: 0 } as any;
  }
}

// ============================================================
// USER
// ============================================================

// ============================== GET USERS
export async function getUsers(limit?: number) {
  const queries: any[] = [Query.orderDesc("$createdAt")];

  if (limit) {
    queries.push(Query.limit(limit));
  }

  try {
    const users = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      queries
    );

    if (!users) throw Error;

    return users;
  } catch (error) {
    console.log(error);
  }
}

// ============================== GET USER BY ID
export async function getUserById(userId: string) {
  try {
    const user = await databases.getDocument(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      userId
    );

    if (!user) throw Error;

    return user;
  } catch (error) {
    console.log(error);
  }
}

// ============================== UPDATE USER
export async function updateUser(user: IUpdateUser) {
  const hasFileToUpdate = user.file.length > 0;
  try {
    let image = {
      imageUrl: user.imageUrl,
      imageId: user.imageId,
    };

    if (hasFileToUpdate) {
      // Upload new file to appwrite storage
      const uploadedFile = await uploadFile(user.file[0]);
      if (!uploadedFile) throw Error;

      // Get new file url
      const fileUrl = getFilePreview(uploadedFile.$id);
      if (!fileUrl) {
        await deleteFile(uploadedFile.$id);
        throw Error;
      }

      image = { ...image, imageUrl: fileUrl, imageId: uploadedFile.$id };
    }

    //  Update user
    const updatedUser = await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      user.userId,
      {
        name: user.name,
        bio: user.bio,
        imageUrl: image.imageUrl,
        imageId: image.imageId,
      }
    );

    // Failed to update
    if (!updatedUser) {
      // Delete new file that has been recently uploaded
      if (hasFileToUpdate) {
        await deleteFile(image.imageId);
      }
      // If no new file uploaded, just throw error
      throw Error;
    }

    // Safely delete old file after successful update
    if (user.imageId && hasFileToUpdate) {
      await deleteFile(user.imageId);
    }

    return updatedUser;
  } catch (error) {
    console.log(error);
  }
}

// ============================== UPDATE USER ROLE
export async function updateUserRole(userId: string, role: "admin" | "user" | "editor") {
  try {
    const updatedUser = await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      userId,
      {
        role: role,
      }
    );

    return updatedUser;
  } catch (error) {
    console.log(error);
    return null;
  }
}

// ============================================================
// CATEGORIES
// ============================================================

// ============================== CREATE CATEGORY
export async function createCategory(name: string) {
  try {
    const newCategory = await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.categoriesCollectionId,
      ID.unique(),
      {
        name: name,
        createdAt: new Date(),
      }
    );

    return newCategory;
  } catch (error) {
    console.log(error);
    return null;
  }
}

// ============================== GET CATEGORIES
export async function getCategories() {
  try {
    const categories = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.categoriesCollectionId,
      [Query.orderAsc("name")]
    );

    return categories;
  } catch (error) {
    console.log(error);
    return null;
  }
}

// ============================== UPDATE CATEGORY
export async function updateCategory(categoryId: string, name: string) {
  try {
    const updatedCategory = await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.categoriesCollectionId,
      categoryId,
      {
        name: name,
      }
    );

    return updatedCategory;
  } catch (error) {
    console.log(error);
    return null;
  }
}

// ============================== DELETE CATEGORY
export async function deleteCategory(categoryId: string) {
  try {
    const result = await databases.deleteDocument(
      appwriteConfig.databaseId,
      appwriteConfig.categoriesCollectionId,
      categoryId
    );

    return result;
  } catch (error) {
    console.log(error);
    return null;
  }
}

// ============================================================
// POST ORDER
// ============================================================

// ============================== SAVE POST ORDER
export async function savePostOrder(orderType: "main" | "side", postIds: string[]) {
  try {
    // Primero verificamos si ya existe un orden para este tipo
    const existingOrder = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.postOrderCollectionId,
      [Query.equal("orderType", orderType)]
    );

    if (existingOrder.documents.length > 0) {
      // Actualizar el orden existente
      const updatedOrder = await databases.updateDocument(
        appwriteConfig.databaseId,
        appwriteConfig.postOrderCollectionId,
        existingOrder.documents[0].$id,
        {
          postIds: postIds,
          updatedAt: new Date(),
        }
      );
      return updatedOrder;
    } else {
      // Crear un nuevo orden
      const newOrder = await databases.createDocument(
        appwriteConfig.databaseId,
        appwriteConfig.postOrderCollectionId,
        ID.unique(),
        {
          orderType: orderType,
          postIds: postIds,
          createdAt: new Date(),
          updatedAt: new Date(),
        }
      );
      return newOrder;
    }
  } catch (error) {
    console.log(error);
    return null;
  }
}

// ============================== GET POST ORDER
export async function getPostOrder(orderType: "main" | "side") {
  try {
    const order = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.postOrderCollectionId,
      [Query.equal("orderType", orderType)]
    );

    if (order.documents.length > 0) {
      return order.documents[0];
    }
    return null;
  } catch (error) {
    console.log(error);
    return null;
  }
}

// ============================== GET ORDERED POSTS
export async function getOrderedPosts(orderType: "main" | "side") {
  try {
    const orderDoc = await getPostOrder(orderType);
    const allPosts = await getAllPosts();
    
    if (!orderDoc || !orderDoc.postIds || orderDoc.postIds.length === 0) {
      // Si no hay orden guardado
      if (orderType === "side") {
        // Para "side": devolver solo destacados
        const featured = allPosts.documents.filter((p: { isFeaturedSide?: boolean }) => Boolean(p.isFeaturedSide));
        return { documents: featured, total: featured.length } as any;
      }
      // Para "main": devolver todos
      return allPosts;
    }

    // Obtener la lista base según el tipo
    const posts = orderType === "side"
      ? { documents: allPosts.documents.filter((p: { isFeaturedSide?: boolean }) => Boolean(p.isFeaturedSide)), total: allPosts.total }
      : allPosts;

    if (!posts) throw Error;

    // Reordenar los posts según el orden guardado
    const orderedPosts = orderDoc.postIds
      .map((postId: string) => posts.documents.find((post: { $id: string }) => post.$id === postId))
      .filter(Boolean);

    // Agregar posts nuevos que no estén en el orden guardado
    const newPosts = posts.documents.filter(
      (post: { $id: string }) => !orderDoc.postIds.includes(post.$id)
    );

    return {
      // Nuevos primero, luego el orden guardado
      documents: [...newPosts, ...orderedPosts],
      total: posts.total
    };
  } catch (error) {
    console.log(error);
    if (orderType === "side") {
      const all = await getAllPosts();
      const featured = all.documents.filter((p: { isFeaturedSide?: boolean }) => Boolean(p.isFeaturedSide));
      return { documents: featured, total: featured.length } as any;
    }
    return await getAllPosts();
  }
}

// ============================== DIAGNÓSTICO DE CONEXIÓN
export async function testDatabaseConnection() {
  console.log("🔍 Iniciando diagnóstico de conexión...");
  
  // Verificar configuración
  console.log("📋 Configuración de Appwrite:");
  console.log("- URL:", appwriteConfig.url);
  console.log("- Project ID:", appwriteConfig.projectId);
  console.log("- Database ID:", appwriteConfig.databaseId);
  console.log("- Post Collection ID:", appwriteConfig.postCollectionId);
  console.log("- User Collection ID:", appwriteConfig.userCollectionId);

  try {
    // Test 1: Verificar conexión básica
    console.log("🧪 Test 1: Verificando conexión con posts...");
    const posts = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.postCollectionId,
      [Query.limit(1)]
    );
    console.log("✅ Conexión con posts exitosa:", posts.total, "posts encontrados");

    // Test 2: Verificar conexión con usuarios
    console.log("🧪 Test 2: Verificando conexión con usuarios...");
    const users = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      [Query.limit(1)]
    );
    console.log("✅ Conexión con usuarios exitosa:", users.total, "usuarios encontrados");

    // Test 3: Verificar datos específicos
    if (posts.documents.length > 0) {
      console.log("🧪 Test 3: Datos de ejemplo encontrados:");
      console.log("- Primer post:", posts.documents[0].title || "Sin título");
      console.log("- ID del post:", posts.documents[0].$id);
      console.log("- Fecha creación:", posts.documents[0].$createdAt);
    }

    return {
      success: true,
      postsCount: posts.total,
      usersCount: users.total,
      samplePost: posts.documents[0] || null
    };

  } catch (error) {
    console.error("❌ Error en diagnóstico:", error);
    return {
      success: false,
      error: error,
      message: error instanceof Error ? error.message : "Error desconocido"
    };
  }
}
