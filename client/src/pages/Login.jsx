import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Login.module.css";
import "./../css/Common.css";
import axios from "axios";

function LoginPage() {
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const LoginSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("/api/login", {
        id,
        password,
      });

      if (res.data.success) {
        console.log(res.data);
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("member_id", res.data.id);
        localStorage.setItem("member_no", res.data.memberNo);
        localStorage.setItem("role", res.data.role);

        navigate(res.data.memberNo === "000000" ? "/admin" : "/user");

        console.log(res.data.role);
      }
    } catch (err) {
      console.log(err);
      alert("로그인 실패...");
    }
  };

  return (
    <div style={{ padding: "40px", textAlign: "center" }}>
      <h2>로그인</h2>
      <div className={styles.container}>
        <form onSubmit={LoginSubmit} className={styles.form}>
          <div className={styles.inputContainer}>
            <input
              type="text"
              className={styles.inputField}
              placeholder=""
              value={id}
              onChange={(e) => setId(e.target.value)}
            />
            <span className={styles.labelText}>아이디</span>
          </div>
          <div className={styles.inputContainer}>
            <input
              type="password"
              className={styles.inputField}
              placeholder=""
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <span className={styles.labelText}>비밀번호</span>
          </div>

          <button className="btn" type="submit">
            로그인
          </button>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;
