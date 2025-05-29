import { useState } from "react";
import axios from "axios";
import styles from "./RegistMemberPop.module.css";

const RegistMember = ({ onClose }) => {
  const [name, setName] = useState("");
  const [role, setRole] = useState("사원");
  const [handle, setHandle] = useState(null);
  const [memberNo, setMemberNo] = useState("");

  const saveMember = async () => {
    if (!name || !handle || !memberNo) {
      alert("이름과 궁 방향을 모두 입력해주세요.");
      return;
    }

    try {
      await axios.post("/api/admin/registMember", {
        name,
        role,
        handle,
        memberNo,
        password: "1234",
      });
      alert("회원 등록이 완료되었습니다.");
      onClose();
    } catch (err) {
      console.error("등록 오류:", err);
      alert("회원 등록에 실패했습니다.");
    }
  };
  return (
    <div className={styles["backdrop"]}>
      <div className={styles["modal"]}>
        <div className={styles["modal-container"]}>
          <div className={styles["modal-header"]}>회원 등록</div>
          <div className={styles["modal-contents"]}>
            <div>
              <input
                type="text"
                className="custom-input"
                placeholder="이름"
                value={name}
                onChange={(e) => setName(e.target.value)}
              ></input>
            </div>

            <div>
              <input
                type="text"
                className="custom-input"
                placeholder="사원 번호"
                value={memberNo}
                onChange={(e) => setMemberNo(e.target.value)}
              ></input>
            </div>

            <div>
              <select
                className="custom-select"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                <option value="사원">사원</option>
                <option value="이사">이사</option>
                <option value="사두">사두</option>
                <option value="부사두">부사두</option>
                <option value="고문">고문</option>
              </select>
            </div>

            <div
              style={{
                flexDirection: "column-reverse",
                alignItems: "flex-start",
                marginBottom: "0px",
              }}
            >
              {[
                { label: "우궁", value: 1 },
                { label: "좌궁", value: -1 },
              ].map((v) => (
                <label className="radio-label" key={v.label}>
                  <input
                    type="radio"
                    name="handle"
                    value={v.value}
                    checked={handle === v.value}
                    onChange={() => setHandle(v.value)}
                  />
                  <span className="custom-radio"></span>
                  {v.label}
                </label>
              ))}
            </div>
          </div>

          <div className={styles["modal-bottom"]}>
            <button className="btn" onClick={saveMember}>
              등록
            </button>
            <button className="cencle" onClick={onClose}>
              닫기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegistMember;
