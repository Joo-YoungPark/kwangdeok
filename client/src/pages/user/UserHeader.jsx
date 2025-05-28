import HeaderStyle from "./UserHeader.module.css";

const Header = () => {
  return (
    <header className={HeaderStyle["header"]}>
      <h2>광덕정 시수관리 시스템</h2>
      <div className={HeaderStyle["user-info"]}>
        안산 광덕정
        <br />
        주영
      </div>
    </header>
  );
};

export default Header;

// const handleLogout = () => {
//   localStorage.removeItem("member_id");
//   // 이후 페이지 이동 or 상태 초기화
// };
