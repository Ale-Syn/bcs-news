import React from "react";

const DebugInfo = () => {
  const envVars = {
    VITE_APPWRITE_URL: import.meta.env.VITE_APPWRITE_URL,
    VITE_APPWRITE_PROJECT_ID: import.meta.env.VITE_APPWRITE_PROJECT_ID,
    VITE_APPWRITE_DATABASE_ID: import.meta.env.VITE_APPWRITE_DATABASE_ID,
    VITE_APPWRITE_STORAGE_ID: import.meta.env.VITE_APPWRITE_STORAGE_ID,
    VITE_APPWRITE_USER_COLLECTION_ID: import.meta.env.VITE_APPWRITE_USER_COLLECTION_ID,
    VITE_APPWRITE_POST_COLLECTION_ID: import.meta.env.VITE_APPWRITE_POST_COLLECTION_ID,
    VITE_APPWRITE_SAVES_COLLECTION_ID: import.meta.env.VITE_APPWRITE_SAVES_COLLECTION_ID,
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">🔍 Debug Info</h1>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Variables de Entorno</h2>
          <div className="space-y-2">
            {Object.entries(envVars).map(([key, value]) => (
              <div key={key} className="flex items-center">
                <span className="font-mono text-sm text-gray-600 w-64">{key}:</span>
                <span className={`font-mono text-sm px-2 py-1 rounded ${
                  value ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {value ? '✅ Configurada' : '❌ No configurada'}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Información del Entorno</h2>
          <div className="space-y-2">
            <div className="flex">
              <span className="font-mono text-sm text-gray-600 w-32">Modo:</span>
              <span className="font-mono text-sm">{import.meta.env.MODE}</span>
            </div>
            <div className="flex">
              <span className="font-mono text-sm text-gray-600 w-32">Dev:</span>
              <span className="font-mono text-sm">{import.meta.env.DEV ? 'Sí' : 'No'}</span>
            </div>
            <div className="flex">
              <span className="font-mono text-sm text-gray-600 w-32">Prod:</span>
              <span className="font-mono text-sm">{import.meta.env.PROD ? 'Sí' : 'No'}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Estado de la Aplicación</h2>
          <p className="text-gray-600 mb-4">
            Si ves esta página, significa que React está funcionando correctamente.
            El problema probablemente está en la configuración de las variables de entorno de Appwrite.
          </p>
          
          <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-4">
            <h3 className="text-lg font-medium text-blue-800 mb-2">Para solucionar:</h3>
            <ol className="list-decimal list-inside text-blue-700 space-y-1">
              <li>Ve a tu dashboard de Vercel</li>
              <li>Selecciona tu proyecto</li>
              <li>Ve a Settings → Environment Variables</li>
              <li>Agrega todas las variables VITE_APPWRITE_* mostradas arriba</li>
              <li>Redeploy tu aplicación</li>
            </ol>
          </div>

          <button 
            onClick={() => window.location.href = '/'}
            className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded"
          >
            Ir al Home (puede fallar si faltan variables)
          </button>
        </div>
      </div>
    </div>
  );
};

export default DebugInfo; 