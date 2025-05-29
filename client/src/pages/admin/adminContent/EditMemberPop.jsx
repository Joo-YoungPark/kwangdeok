import { useEffect, useState } from "react";
import axios from "axios";
import styles from "./RegistMemberPop.module.css";

const EditMember = ({ member, onClose }) => {
  const [name, setName] = useState("");
  const [role, setRole] = useState("사원");
  const [handle, setHandle] = useState(null);
  const [memberNo, setMemberNo] = useState("");

  // 초기 데이터 설정
  useEffect(() => {
    if (member) {
      setName(member.name || "");
      setMemberNo(member.member_no || "");
      setRole(member.role || "사원");
      setHandle(member.handle ?? 0);
    }
  }, [member]);

  const editMember = async () => {
    if (!name || !role || !handle || !memberNo) {
      alert("이름, 직책, 궁 방향, 사원번호는 모두 필수입니다.");
      return;
    }

    try {
      await axios.post("/api/admin/editMember", {
        id: member.member_id,
        name,
        role,
        handle,
        memberNo,
      });
      alert("회원 수정이 완료되었습니다.");
      onClose();
    } catch (err) {
      console.error("수정 오류:", err);
    }
  };
  return (
    <div className={styles["backdrop"]}>
      <div className={styles["modal"]}>
        <div className={styles["modal-container"]}>
          <div className={styles["modal-header"]}>회원정보 수정</div>
          <div className={styles["modal-contents"]}>
            <div>
              {/* 이름 (비활성화) */}
              <input
                type="text"
                className="custom-input"
                placeholder="사원고유아이디"
                value={member.member_id}
                disabled
                style={{ display: "none" }}
              ></input>
              {/* 사원 이름 */}
              <input
                type="text"
                className="custom-input"
                placeholder="이름"
                value={name}
                disabled
                onChange={(e) => setName(e.target.value)}
              ></input>
            </div>

            <div>
              {/* 사원번호 */}
              <input
                type="text"
                className="custom-input"
                placeholder="사원 번호"
                value={memberNo}
                onChange={(e) => setMemberNo(e.target.value)}
              ></input>
            </div>
            {/* 직책 선택 */}
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
              </select>
            </div>

            {/* 궁 방향 라디오 */}
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
                    checked={Number(handle) === v.value}
                    onChange={() => setHandle(v.value)}
                  />
                  <span className="custom-radio"></span>
                  {v.label}
                </label>
              ))}
            </div>
          </div>
          {/* 하단 버튼 */}
          <div className={styles["modal-bottom"]}>
            <button className="btn" onClick={editMember}>
              저장
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

export default EditMember;
