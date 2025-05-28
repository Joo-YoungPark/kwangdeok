import { useEffect, useState } from "react";
import Header from "./AdminHeader.jsx";
import AdminTab from "./adminContent/AdminTab.jsx";
import { Outlet } from "react-router-dom";

function AdminMain() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div style={{ paddingBottom: isMobile ? "60px" : "0" }}>
      <Header />
      {!isMobile && <AdminTab layout="top" />}
      <Outlet />
      {isMobile && <AdminTab layout="bottom" />}
    </div>
  );
}

export default AdminMain;
