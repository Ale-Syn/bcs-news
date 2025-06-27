import { useParams } from "react-router-dom";

import { Loader } from "@/components/shared";
import PostForm from "@/components/forms/PostForm";
import { useGetPostById } from "@/lib/react-query/queries";

const EditPost = () => {
  const { id } = useParams();
  const { data: post, isLoading } = useGetPostById(id);

  if (isLoading)
    return (
      <div className="flex-center w-full h-full">
        <Loader />
      </div>
    );

  return (
    <div className="flex flex-1">
      <div className="common-container">
        <div className="max-w-5xl flex-start gap-3 justify-start w-full">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-3">
              <img src="/assets/icons/edit.svg" width={36} height={36} alt="edit" />
              <h2 className="h3-bold md:h2-bold text-[#1A1A1A]">
                Editar Noticia
              </h2>
            </div>
            <div className="h-1 w-20 bg-[#BB1919] rounded-full ml-12"></div>
          </div>
        </div>

        <div className="w-full max-w-5xl bg-white rounded-2xl border border-[#E5E5E5] p-6">
          {isLoading ? <Loader /> : <PostForm action="Editar" post={post} />}
        </div>
      </div>
    </div>
  );
};

export default EditPost;
