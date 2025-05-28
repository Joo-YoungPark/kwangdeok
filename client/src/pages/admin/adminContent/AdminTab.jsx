// src/components/UserTab.jsx
import { useNavigate, useLocation } from "react-router-dom";
import "../../../css/TabStyle.css";

function AdminTab({ layout }) {
  const navigate = useNavigate();
  const location = useLocation();

  const tabs = [
    { label: "편사기록", path: "adminRecord", icon: "📝" },
    { label: "회원정보", path: "member", icon: "📅" },
    // { label: "상세기록", path: "calendar", icon: "📄" },
  ];

  return (
    // <div className="tab-container-top">
    <div
      className={
        layout === "top" ? "tab-container-top" : "tab-container-bottom"
      }
    >
      {}
      {/* <div className={layout === "top" ? "tab-top" : "tab-bottom"}> */}
      {tabs.map((tab) => (
        <div
          key={tab.label}
          className={`tab-item ${
            location.pathname.endsWith(tab.path) ? "active" : ""
          }`}
          onClick={() => {
            if (tab.path) navigate(tab.path);
          }}
        >
          <div>{tab.icon}</div>
          <div>{tab.label}</div>
        </div>
      ))}
      {/* </div> */}
    </div>
  );
}

export default AdminTab;
