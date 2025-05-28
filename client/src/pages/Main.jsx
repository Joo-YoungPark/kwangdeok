import React from "react";
import { useNavigate } from "react-router-dom";
import "./../css/Common.css";

function MainPage() {
  const navigate = useNavigate();

  return (
    <div style={{ padding: "40px", textAlign: "center" }}>
      <h1>광덕정 시수관리</h1>
      <p>오늘도 한 걸음, 수련의 길을 향해.</p>

      {/* <div style={{ marginTop: '40px' }}>
        <button style={btnStyle}>시수 입력하기</button>
        <button style={{ ...btnStyle, marginLeft: '20px' }}>기록 보기</button>
      </div> */}

      <div style={{ marginTop: "40px" }}>
        <button className="btn" onClick={() => navigate("/login")}>
          로그인
        </button>
      </div>
    </div>
  );
}

export default MainPage;
