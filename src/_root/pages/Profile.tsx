import {
  Route,
  Routes,
  Link,
  Outlet,
  useParams,
  useLocation,
} from "react-router-dom";

import { Button } from "@/components/ui";
import { LikedPosts } from "@/_root/pages";
import { useUserContext } from "@/context/AuthContext";
import { useGetUserById } from "@/lib/react-query/queries";
import { DraggableGridPostList, Loader } from "@/components/shared";

const Profile = () => {
  const { id } = useParams();
  const { user } = useUserContext();
  const { pathname } = useLocation();

  const { data: currentUser } = useGetUserById(id || "");

  if (!currentUser)
    return (
      <div className="flex-center w-full h-full">
        <Loader />
      </div>
    );

  return (
    <div className="profile-container">
      <div className="profile-inner_container">
        <div className="flex xl:flex-row flex-col max-xl:items-center flex-1 gap-7">
          <img
            src={
              currentUser.imageUrl || "/assets/icons/profile-placeholder.svg"
            }
            alt="profile"
            className="w-28 h-28 lg:h-36 lg:w-36 rounded-full border-4 border-[#BB1919]"
          />
          <div className="flex flex-col flex-1 justify-between md:mt-2">
            <div className="flex flex-col w-full">
              <h1 className="text-center xl:text-left h3-bold md:h1-semibold w-full text-[#1A1A1A]">
                {currentUser.name}
              </h1>
              <p className="small-regular md:body-medium text-[#666666] text-center xl:text-left">
                @{currentUser.username}
              </p>
            </div>

            <p className="small-medium md:base-medium text-center xl:text-left mt-7 max-w-screen-sm text-[#1A1A1A]">
              {currentUser.bio}
            </p>
          </div>

          <div className="flex justify-center gap-4">
            <div className={`${user.id !== currentUser.$id && "hidden"}`}>
              <Link
                to={`/update-profile/${currentUser.$id}`}
                className={`h-12 bg-[#F8F8F8] px-5 text-[#1A1A1A] flex-center gap-2 rounded-lg hover:bg-[#F0F0F0] transition-colors duration-200 ${
                  user.id !== currentUser.$id && "hidden"
                }`}>
                <img
                  src={"/assets/icons/edit.svg"}
                  alt="edit"
                  width={20}
                  height={20}
                />
                <p className="flex whitespace-nowrap small-medium">
                  Editar Perfil
                </p>
              </Link>
            </div>
            <div className={`${user.id === id && "hidden"}`}>
              <Button type="button" className="shad-button_primary px-8">
                Donar
              </Button>
            </div>
          </div>
        </div>
      </div>

      {currentUser.$id === user.id && (
        <div className="flex max-w-5xl w-full">
          <Link
            to={`/profile/${id}`}
            className={`profile-tab rounded-l-lg ${
              pathname === `/profile/${id}` && "!bg-[#F0F0F0] text-[#BB1919]"
            }`}>
            <img
              src={"/assets/icons/posts.svg"}
              alt="posts"
              width={20}
              height={20}
            />
            Noticias
          </Link>
          <Link
            to={`/profile/${id}/liked-posts`}
            className={`profile-tab rounded-r-lg ${
              pathname === `/profile/${id}/liked-posts` && "!bg-[#F0F0F0] text-[#BB1919]"
            }`}>
            <img
              src={"/assets/icons/like.svg"}
              alt="like"
              width={20}
              height={20}
            />
            Noticias Guardadas
          </Link>
        </div>
      )}

      <Routes>
        <Route
          index
                        element={
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="h3-bold md:h2-bold text-[#1A1A1A]">
                      Posts
                      <div className="h-1 w-20 bg-[#BB1919] rounded-full"></div>
                    </h2>
                  </div>
                  <DraggableGridPostList 
                    posts={currentUser.posts} 
                    showUser={false}
                    onReorder={(newOrder) => {
                      // Guardar el orden en localStorage
                      localStorage.setItem('profilePostOrder', JSON.stringify(newOrder.map(post => post.$id)));
                    }}
                  />
                </div>
              }
        />
        {currentUser.$id === user.id && (
          <Route path="/liked-posts" element={<LikedPosts />} />
        )}
      </Routes>
      <Outlet />
    </div>
  );
};

export default Profile;
