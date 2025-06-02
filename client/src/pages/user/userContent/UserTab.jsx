// src/components/UserTab.jsx
import { useNavigate, useLocation } from "react-router-dom";
import "../../../css/TabStyle.css";

function UserTab({ layout }) {
  const navigate = useNavigate();
  const location = useLocation();

  const tabs = [
    { label: "습사기록", path: "UserRecord", icon: "📝" },
    { label: "습사달력", path: "calendar", icon: "📅" },
    { label: "습사통계", path: "state", icon: "📈" },
    { label: "활터정보", path: "place", icon: "📈" },
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

export default UserTab;
