import { Outlet } from "react-router-dom";

const PublicLayout = () => {
  return (
    <div className="w-full min-h-screen">
      <main className="flex flex-1 flex-col">
        <Outlet />
      </main>
    </div>
  );
};

export default PublicLayout; 