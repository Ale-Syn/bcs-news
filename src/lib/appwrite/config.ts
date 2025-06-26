import { Client, Account, Databases, Storage, Avatars } from "appwrite";

export const appwriteConfig = {
  url: import.meta.env.VITE_APPWRITE_URL,
  projectId: import.meta.env.VITE_APPWRITE_PROJECT_ID,
  databaseId: import.meta.env.VITE_APPWRITE_DATABASE_ID,
  storageId: import.meta.env.VITE_APPWRITE_STORAGE_ID,
  userCollectionId: import.meta.env.VITE_APPWRITE_USER_COLLECTION_ID,
  postCollectionId: import.meta.env.VITE_APPWRITE_POST_COLLECTION_ID,
  savesCollectionId: import.meta.env.VITE_APPWRITE_SAVES_COLLECTION_ID,
  categoriesCollectionId: import.meta.env.VITE_APPWRITE_CATEGORIES_COLLECTION_ID,
  postOrderCollectionId: import.meta.env.VITE_APPWRITE_POST_ORDER_COLLECTION_ID,
};

// Validar que las variables de entorno estén configuradas
const requiredEnvVars = [
  'VITE_APPWRITE_URL',
  'VITE_APPWRITE_PROJECT_ID',
  'VITE_APPWRITE_DATABASE_ID',
  'VITE_APPWRITE_STORAGE_ID',
  'VITE_APPWRITE_USER_COLLECTION_ID',
  'VITE_APPWRITE_POST_COLLECTION_ID',
  'VITE_APPWRITE_SAVES_COLLECTION_ID',
  'VITE_APPWRITE_CATEGORIES_COLLECTION_ID',
  'VITE_APPWRITE_POST_ORDER_COLLECTION_ID'
];

const missingEnvVars = requiredEnvVars.filter(envVar => !import.meta.env[envVar]);

if (missingEnvVars.length > 0) {
  console.error('⚠️ Variables de entorno faltantes en Vercel:', missingEnvVars);
  console.error('Por favor configura estas variables en tu dashboard de Vercel');
}

export const client = new Client();

if (appwriteConfig.url && appwriteConfig.projectId) {
  client.setEndpoint(appwriteConfig.url);
  client.setProject(appwriteConfig.projectId);
} else {
  console.error('⚠️ Configuración de Appwrite incompleta');
}

export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);
export const avatars = new Avatars(client);
