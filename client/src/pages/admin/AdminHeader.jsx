import HeaderStyle from "./AdminHeader.module.css";

const Header = () => {
  return (
    <header className={HeaderStyle["header"]}>
      <h2>광덕정 시수관리 시스템(관리자)</h2>
      <div className={HeaderStyle["user-info"]}>
        안산 광덕정
        <br />
        주영
      </div>
    </header>
  );
};

export default Header;
