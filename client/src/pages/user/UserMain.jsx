import { useEffect, useState } from "react";
import Header from "./UserHeader.jsx";
import UserTab from "./userContent/UserTab.jsx";
import { Outlet } from "react-router-dom";

function UserMain() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div style={{ paddingBottom: isMobile ? "60px" : "0" }}>
      <Header />
      {!isMobile && <UserTab layout="top" />}
      <Outlet />
      {isMobile && <UserTab layout="bottom" />}
    </div>
  );
}

export default UserMain;
