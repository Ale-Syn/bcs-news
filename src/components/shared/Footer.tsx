import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { useState } from "react";

const Footer = () => {
  const [email, setEmail] = useState("");
  const [isAboutModalOpen, setIsAboutModalOpen] = useState(false);
  const [isTermsModalOpen, setIsTermsModalOpen] = useState(false);
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Aquí se puede agregar la lógica para manejar la suscripción
    console.log("Email suscrito:", email);
    setEmail("");
  };

  const openAboutModal = () => {
    setIsAboutModalOpen(true);
  };

  const closeAboutModal = () => {
    setIsAboutModalOpen(false);
  };

  const openTermsModal = () => {
    setIsTermsModalOpen(true);
  };

  const closeTermsModal = () => {
    setIsTermsModalOpen(false);
  };

  const openPrivacyModal = () => {
    setIsPrivacyModalOpen(true);
  };

  const closePrivacyModal = () => {
    setIsPrivacyModalOpen(false);
  };

  return (
    <>
      <footer className="bg-[#E5E5E5] text-[#1A1A1A] mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Información de Contacto */}
            <div>
              <h3 className="text-lg font-bold mb-4 text-[#BB1919]">Contacto</h3>
              <div className="space-y-2">
                <p>Email: admin@altavozbcs.com</p>
                <p>Teléfono: (123) 456-7890</p>
                
              </div>
            </div>

            {/* Enlaces Rápidos */}
            <div>
              <h3 className="text-lg font-bold mb-4 text-[#BB1919]">Enlaces Rápidos</h3>
              <ul className="space-y-2">
                <li>
                  <button 
                    onClick={openAboutModal}
                    className="hover:text-[#BB1919] text-left underline-offset-2 hover:underline cursor-pointer"
                  >
                    Sobre Nosotros
                  </button>
                </li>
                <li>
                  <button 
                    onClick={openPrivacyModal}
                    className="hover:text-[#BB1919] text-left underline-offset-2 hover:underline cursor-pointer"
                  >
                    Política de Privacidad
                  </button>
                </li>
                <li>
                  <button 
                    onClick={openTermsModal}
                    className="hover:text-[#BB1919] text-left underline-offset-2 hover:underline cursor-pointer"
                  >
                    Términos y Condiciones
                  </button>
                </li>
              </ul>
            </div>

            {/* Suscripción */}
            <div>
              <h3 className="text-lg font-bold mb-4 text-[#BB1919]">Suscríbete</h3>
              <p className="mb-4">Recibe las últimas noticias directamente en tu correo.</p>
              <form onSubmit={handleSubmit} className="space-y-2">
                <Input
                  type="email"
                  placeholder="Tu correo electrónico"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-white border-[#D1D1D1] text-[#1A1A1A] placeholder:text-[#4A4A4A]"
                  required
                />
                <Button 
                  type="submit"
                  className="w-full bg-[#BB1919] text-white hover:bg-[#A51717]"
                >
                  Suscribirse
                </Button>
              </form>
            </div>
          </div>

          {/* Línea divisoria */}
          <div className="border-t border-[#D1D1D1] mt-8 pt-8">
            <p className="text-center text-sm text-[#4A4A4A]">
              
              © {new Date().getFullYear()} La Voz. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </footer>

      {/* Modal Sobre Nosotros */}
      {isAboutModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header del Modal */}
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-[#BB1919]">Sobre Nosotros</h2>
              <button
                onClick={closeAboutModal}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>
            
            {/* Contenido del Modal */}
            <div className="p-6">
              <p className="text-[#1A1A1A] leading-relaxed text-lg">
                Somos un medio de comunicación comprometido con la verdad, la responsabilidad social y la generación de contenido informativo de calidad. Ofrecemos espacios estratégicos de difusión para empresas, emprendedores y proyectos que desean conectar con su audiencia de forma auténtica, profesional y efectiva.
              </p>
            </div>
            
            {/* Footer del Modal */}
            <div className="flex justify-end p-6 border-t border-gray-200">
              <Button
                onClick={closeAboutModal}
                className="bg-[#BB1919] text-white hover:bg-[#A51717]"
              >
                Cerrar
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Política de Privacidad */}
      {isPrivacyModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header del Modal */}
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-[#BB1919]">Política de Privacidad</h2>
              <button
                onClick={closePrivacyModal}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>
            
            {/* Contenido del Modal */}
            <div className="p-6 space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-[#BB1919] mb-3">1. Información que Recopilamos</h3>
                <p className="text-[#1A1A1A] leading-relaxed">
                  En "Altavoz BCS" recopilamos información personal que usted nos proporciona voluntariamente, como su nombre, dirección de correo electrónico cuando se suscribe a nuestro boletín, y datos de contacto cuando interactúa con nosotros. También recopilamos información automáticamente a través de cookies y tecnologías similares sobre su uso de nuestra plataforma.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-[#BB1919] mb-3">2. Uso de la Información</h3>
                <p className="text-[#1A1A1A] leading-relaxed">
                  Utilizamos su información personal para proporcionarle nuestros servicios, enviarle contenido relevante, mejorar nuestra plataforma, comunicarnos con usted sobre actualizaciones importantes, y personalizar su experiencia. También podemos usar esta información para fines analíticos y de marketing con su consentimiento.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-[#BB1919] mb-3">3. Compartir Información</h3>
                <p className="text-[#1A1A1A] leading-relaxed">
                  No vendemos, alquilamos o compartimos su información personal con terceros para fines comerciales sin su consentimiento explícito. Podemos compartir información con proveedores de servicios que nos ayudan a operar nuestra plataforma, siempre bajo estrictos acuerdos de confidencialidad.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-[#BB1919] mb-3">4. Cookies y Tecnologías Similares</h3>
                <p className="text-[#1A1A1A] leading-relaxed">
                  Utilizamos cookies para mejorar su experiencia en nuestro sitio web, recordar sus preferencias, y analizar cómo utiliza nuestra plataforma. Puede controlar el uso de cookies a través de la configuración de su navegador, aunque esto puede afectar la funcionalidad del sitio.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-[#BB1919] mb-3">5. Seguridad de los Datos</h3>
                <p className="text-[#1A1A1A] leading-relaxed">
                  Implementamos medidas de seguridad técnicas y organizativas apropiadas para proteger su información personal contra acceso no autorizado, alteración, divulgación o destrucción. Sin embargo, ningún método de transmisión por internet es 100% seguro.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-[#BB1919] mb-3">6. Sus Derechos</h3>
                <p className="text-[#1A1A1A] leading-relaxed">
                  Usted tiene derecho a acceder, corregir, actualizar o solicitar la eliminación de su información personal. También puede oponerse al procesamiento de sus datos o solicitar la portabilidad de los mismos. Para ejercer estos derechos, contáctenos a través de admin@altavozbcs.com
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-[#BB1919] mb-3">7. Retención de Datos</h3>
                <p className="text-[#1A1A1A] leading-relaxed">
                  Conservamos su información personal solo durante el tiempo necesario para cumplir con los propósitos para los cuales fue recopilada, o según lo requiera la ley aplicable.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-[#BB1919] mb-3">8. Cambios a esta Política</h3>
                <p className="text-[#1A1A1A] leading-relaxed">
                  Podemos actualizar esta Política de Privacidad ocasionalmente. Le notificaremos cualquier cambio significativo publicando la nueva política en nuestro sitio web y actualizando la fecha de "última modificación".
                </p>
              </div>

              <div className="border-t border-gray-200 pt-4">
                <p className="text-sm text-[#4A4A4A]">
                  Última actualización: {new Date().toLocaleDateString('es-ES')}
                </p>
              </div>
            </div>
            
            {/* Footer del Modal */}
            <div className="flex justify-end p-6 border-t border-gray-200">
              <Button
                onClick={closePrivacyModal}
                className="bg-[#BB1919] text-white hover:bg-[#A51717]"
              >
                Cerrar
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Términos y Condiciones */}
      {isTermsModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header del Modal */}
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-[#BB1919]">Términos y Condiciones</h2>
              <button
                onClick={closeTermsModal}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>
            
            {/* Contenido del Modal */}
            <div className="p-6 space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-[#BB1919] mb-3">1. Aceptación de los Términos</h3>
                <p className="text-[#1A1A1A] leading-relaxed">
                  Al acceder y utilizar la plataforma "Altavoz BCS", usted acepta cumplir con estos términos y condiciones. Si no está de acuerdo con alguno de estos términos, no debe utilizar nuestros servicios.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-[#BB1919] mb-3">2. Uso del Contenido</h3>
                <p className="text-[#1A1A1A] leading-relaxed">
                  Todo el contenido publicado en esta plataforma es propiedad de "Altavoz BCS" o de sus respectivos autores. La reproducción, distribución o modificación del contenido sin autorización expresa está prohibida.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-[#BB1919] mb-3">3. Conducta del Usuario</h3>
                <p className="text-[#1A1A1A] leading-relaxed">
                  Los usuarios se comprometen a usar la plataforma de manera responsable, evitando publicar contenido ofensivo, difamatorio, ilegal o que viole los derechos de terceros. Nos reservamos el derecho de eliminar contenido inapropiado.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-[#BB1919] mb-3">4. Privacidad y Datos</h3>
                <p className="text-[#1A1A1A] leading-relaxed">
                  Respetamos su privacidad y protegemos sus datos personales conforme a nuestra Política de Privacidad. Al utilizar nuestros servicios, usted consiente el tratamiento de sus datos según se describe en dicha política.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-[#BB1919] mb-3">5. Limitación de Responsabilidad</h3>
                <p className="text-[#1A1A1A] leading-relaxed">
                  "Altavoz BCS" no se hace responsable por daños directos, indirectos, incidentales o consecuentes que puedan resultar del uso de la plataforma o de la información contenida en ella.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-[#BB1919] mb-3">6. Modificaciones</h3>
                <p className="text-[#1A1A1A] leading-relaxed">
                  Nos reservamos el derecho de modificar estos términos y condiciones en cualquier momento. Las modificaciones entrarán en vigor una vez publicadas en la plataforma.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-[#BB1919] mb-3">7. Contacto</h3>
                <p className="text-[#1A1A1A] leading-relaxed">
                  Para cualquier consulta sobre estos términos y condiciones, puede contactarnos a través de admin@altavozbcs.com
                </p>
              </div>

              <div className="border-t border-gray-200 pt-4">
                <p className="text-sm text-[#4A4A4A]">
                  Última actualización: {new Date().toLocaleDateString('es-ES')}
                </p>
              </div>
            </div>
            
            {/* Footer del Modal */}
            <div className="flex justify-end p-6 border-t border-gray-200">
              <Button
                onClick={closeTermsModal}
                className="bg-[#BB1919] text-white hover:bg-[#A51717]"
              >
                Cerrar
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Footer; 