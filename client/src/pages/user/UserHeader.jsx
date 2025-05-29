import React, { useEffect, useState } from "react";
import HeaderStyle from "./UserHeader.module.css";
import { useNavigate } from "react-router-dom";
import { IoLogOutOutline } from "react-icons/io5";

const Header = () => {
  const [name, setName] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const name = localStorage.getItem("name");

    setName(name);
  }, []);

  const logout = () => {
    if (confirm("로그아웃됩니다.")) {
      localStorage.clear();
      navigate("/login");
    }
  };

  return (
    <header className={HeaderStyle["header"]}>
      <h2>광덕정 시수관리 시스템</h2>
      <div
        className={HeaderStyle["user-info"]}
        onClick={logout}
        title="로그아웃"
      >
        <div className={HeaderStyle["logout_text"]}>{name}</div>
        <div className={HeaderStyle["logout_img"]}>
          <IoLogOutOutline size={40} />
        </div>
      </div>
    </header>
  );
};

export default Header;

// const handleLogout = () => {
//   localStorage.removeItem("member_id");
//   // 이후 페이지 이동 or 상태 초기화
// };
