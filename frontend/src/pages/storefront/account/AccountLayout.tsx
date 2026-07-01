import { Outlet, useLocation } from "react-router-dom";

// Account bo'limi qobig'i — markazlangan, sahifa o'tish animatsiyasi bilan
export default function AccountLayout() {
  const location = useLocation();
  return (
    <div className="container-page py-6 lg:py-10">
      <div className="mx-auto max-w-xl">
        <div key={location.pathname} className="page-transition">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
