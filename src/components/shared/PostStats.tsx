import { Models } from "appwrite";
import { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { Share2, Facebook, Instagram, Link as LinkIcon, Heart } from "lucide-react";

import {
  useSavePost,
  useDeleteSavedPost,
  useGetCurrentUser,
  useLikePost,
} from "@/lib/react-query/queries";
import { useUserContext } from "@/context/AuthContext";
import { checkIsLiked } from "@/lib/utils";

type PostStatsProps = {
  post: Models.Document;
  userId?: string;
};

const PostStats = ({ post, userId }: PostStatsProps) => {
  const location = useLocation();
  const { isAuthenticated, user } = useUserContext();
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const shareMenuRef = useRef<HTMLDivElement>(null);

  const [likes, setLikes] = useState<string[]>(post.likes || []);
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const { mutate: likePost } = useLikePost();
  const { mutate: savePost } = useSavePost();
  const { mutate: deleteSavePost } = useDeleteSavedPost();

  const { data: currentUser } = useGetCurrentUser();

  const savedPostRecord = currentUser?.save?.find(
    (record: Models.Document) => record?.post?.$id === post.$id
  );

  // Añadir función global para debuggear desde la consola
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).debugLikes = {
        clearAllGuestLikes: () => {
          localStorage.removeItem('guestLikes');
          console.log('✅ Todos los likes de invitados han sido limpiados');
        },
        showGuestLikes: () => {
          const likes = localStorage.getItem('guestLikes');
          console.log('🔍 Likes de invitados:', likes ? JSON.parse(likes) : 'Ninguno');
        },
        clearLikesForPost: (postId: string) => {
          const localLikes = localStorage.getItem('guestLikes');
          if (localLikes) {
            let likesArray = JSON.parse(localLikes);
            likesArray = likesArray.filter((id: string) => id !== postId);
            localStorage.setItem('guestLikes', JSON.stringify(likesArray));
            console.log(`✅ Likes para el post ${postId} han sido limpiados`);
          }
        }
      };
    }
  }, []);

  // Función para obtener likes de localStorage para usuarios no autenticados
  const getLocalLikes = (postId: string): boolean => {
    if (typeof window === 'undefined') return false;
    try {
      const localLikes = localStorage.getItem('guestLikes');
      if (!localLikes) return false;
      const likesArray = JSON.parse(localLikes);
      return Array.isArray(likesArray) && likesArray.includes(postId);
    } catch (error) {
      console.warn('Error reading guestLikes from localStorage:', error);
      localStorage.removeItem('guestLikes');
      return false;
    }
  };

  // Función para guardar likes en localStorage para usuarios no autenticados
  const setLocalLikes = (postId: string, liked: boolean) => {
    if (typeof window === 'undefined') return;
    try {
      const localLikes = localStorage.getItem('guestLikes');
      let likesArray = localLikes ? JSON.parse(localLikes) : [];
      
      if (!Array.isArray(likesArray)) {
        likesArray = [];
      }
      
      if (liked) {
        if (!likesArray.includes(postId)) {
          likesArray.push(postId);
        }
      } else {
        likesArray = likesArray.filter((id: string) => id !== postId);
      }
      
      localStorage.setItem('guestLikes', JSON.stringify(likesArray));
    } catch (error) {
      console.warn('Error saving guestLikes to localStorage:', error);
    }
  };

  useEffect(() => {
    setIsSaved(!!savedPostRecord);
  }, [currentUser, savedPostRecord]);

  useEffect(() => {
    // Verificar si el post está likeado
    if (isAuthenticated && userId) {
      setIsLiked(checkIsLiked(likes, userId));
    } else {
      // Para usuarios no autenticados, verificar localStorage
      setIsLiked(getLocalLikes(post.$id));
    }
  }, [likes, userId, isAuthenticated, post.$id]);

  useEffect(() => {
    // Filtrar y limpiar los likes del post para asegurar que solo contenga strings válidos
    const cleanLikes = (post.likes || []).filter((id: any) => typeof id === 'string' && id.length > 0);
    setLikes(cleanLikes);
  }, [post.likes]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (shareMenuRef.current && !shareMenuRef.current.contains(event.target as Node)) {
        setIsShareOpen(false);
      }
    };

    const handleScroll = () => {
      setIsShareOpen(false);
    };

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('scroll', handleScroll, true); // true para capturar en fase de captura
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('scroll', handleScroll, true);
    };
  }, []);

  const handleLikePost = (e: React.MouseEvent) => {
    e.stopPropagation();

    // Filtrar y limpiar el array de likes para asegurar que solo contenga strings válidos
    let likesArray = [...likes].filter(id => typeof id === 'string' && id.length > 0);
    const currentlyLiked = isAuthenticated && userId ? likesArray.includes(userId) : getLocalLikes(post.$id);

    if (isAuthenticated && userId) {
      // Usuario autenticado - usar la funcionalidad existente
      if (currentlyLiked) {
        likesArray = likesArray.filter((Id) => Id !== userId);
      } else {
        likesArray.push(userId);
      }
    } else {
      // Usuario no autenticado - manejar con localStorage
      if (currentlyLiked) {
        // Quitar like - solo quitar un ID de guest para este post específico
        const firstGuestIndex = likesArray.findIndex(id => 
          typeof id === 'string' && id.startsWith('guest_')
        );
        if (firstGuestIndex !== -1) {
          likesArray.splice(firstGuestIndex, 1);
        }
        setLocalLikes(post.$id, false);
      } else {
        // Añadir like - generar nuevo ID de guest
        const guestId = `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        likesArray.push(guestId);
        setLocalLikes(post.$id, true);
      }
    }

    // Actualizar estado local inmediatamente para feedback visual rápido
    setLikes(likesArray);
    setIsLiked(!currentlyLiked);
    
    // Actualizar en la base de datos
    likePost({ postId: post.$id, likesArray });
  };

  const handleSavePost = (
    e: React.MouseEvent<HTMLImageElement, MouseEvent>
  ) => {
    e.stopPropagation();

    if (!isAuthenticated || !userId || user.role !== "ADMIN") {
      return;
    }

    if (savedPostRecord) {
      setIsSaved(false);
      return deleteSavePost(savedPostRecord.$id);
    }

    savePost({ userId: userId, postId: post.$id });
    setIsSaved(true);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.origin + "/posts/" + post.$id);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
    setIsShareOpen(false); // Cerrar menú después de copiar
  };

  const handleShareFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.origin + "/posts/" + post.$id)}`, '_blank');
    setIsShareOpen(false); // Cerrar menú después de compartir
  };

  const handleShareInstagram = () => {
    window.open(`https://www.instagram.com/`, '_blank');
    setIsShareOpen(false); // Cerrar menú después de compartir
  };

  const containerStyles = location.pathname.startsWith("/profile")
    ? "w-full"
    : "";

  const isAdmin = isAuthenticated && user.role === "ADMIN";

  return (
    <div
      className={`flex justify-between items-center z-10 ${containerStyles}`}>
      {/* Sección de likes a la izquierda */}
      <div className="flex items-center gap-2">
        <button
          onClick={handleLikePost}
          className="flex items-center gap-1 hover:opacity-70 transition-opacity"
        >
          <Heart 
            className={`w-5 h-5 ${
              isLiked 
                ? "text-[#BB1919] fill-[#BB1919]" 
                : "text-[#1A1A1A] hover:text-[#BB1919]"
            } transition-colors`}
          />
        </button>
      </div>

      {/* Sección de acciones a la derecha */}
      <div className="flex gap-2">
        <div className="relative z-10" ref={shareMenuRef}>
          <Share2
            className="w-5 h-5 cursor-pointer text-[#1A1A1A] hover:text-[#BB1919]"
            onClick={() => setIsShareOpen(!isShareOpen)}
          />
          {isShareOpen && (
            <div className="fixed w-48 bg-white rounded-lg shadow-xl border border-[#E5E5E5] py-2 z-30 shadow-2xl" 
                 style={{
                   top: shareMenuRef.current ? 
                     shareMenuRef.current.getBoundingClientRect().bottom + 8 + 'px' : 
                     'auto',
                   right: shareMenuRef.current ? 
                     window.innerWidth - shareMenuRef.current.getBoundingClientRect().right + 'px' : 
                     'auto'
                 }}>
              <button
                onClick={handleCopyLink}
                className="flex items-center w-full px-4 py-2 text-sm text-[#1A1A1A] hover:bg-[#F5F5F5]">
                <LinkIcon className="w-4 h-4 mr-2" />
                {isCopied ? "Enlace copiado" : "Copiar enlace"}
              </button>
              <button
                onClick={handleShareFacebook}
                className="flex items-center w-full px-4 py-2 text-sm text-[#1A1A1A] hover:bg-[#F5F5F5]">
                <Facebook className="w-4 h-4 mr-2 text-[#1877F2]" />
                Compartir en Facebook
              </button>
              <button
                onClick={handleShareInstagram}
                className="flex items-center w-full px-4 py-2 text-sm text-[#1A1A1A] hover:bg-[#F5F5F5]">
                <Instagram className="w-4 h-4 mr-2 text-[#E4405F]" />
                Compartir en Instagram
              </button>
            </div>
          )}
        </div>
        
        {isAdmin && (
          <img
            src={isSaved ? "/assets/icons/saved.svg" : "/assets/icons/save.svg"}
            alt="save"
            width={20}
            height={20}
            className="cursor-pointer"
            onClick={(e) => handleSavePost(e)}
          />
        )}
      </div>
    </div>
  );
};

export default PostStats;
