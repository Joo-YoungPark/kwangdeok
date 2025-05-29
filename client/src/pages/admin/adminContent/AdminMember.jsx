import React, { useEffect, useState } from "react";
import axios from "axios";
import adminMemberStyle from "./AdminMember.module.css";
import { BiDetail } from "react-icons/bi"; // npm install react-icons

import RegistModal from "./RegistMemberPop.jsx";
import EditModal from "./EditMemberPop.jsx";

function AdminMember() {
  const [searchType, setSearchType] = useState("all");
  const [searchKeyword, setSearchKeyword] = useState("");

  const [members, setMembers] = useState([]);
  const [checked, setChecked] = useState([]);

  const [registModalOpen, setRegistModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editMemberData, setEditMemberData] = useState(null);

  useEffect(() => {
    searchMemberList();
  }, []);

  /* 사원 리스트 불러오기 */
  const searchMemberList = async () => {
    try {
      const res = await axios.get("/api/admin/getMemberList", {
        params: { searchType, searchKeyword },
      });
      if (res.data.success) {
        setMembers(res.data.members);
      }
    } catch (err) {
      console.error("회원 목록 불러오기 실패:", err);
    }
  };

  /* 사원 등록 팝업 오픈 */
  const registMember = () => setRegistModalOpen(true);
  // 사원 등록 팝업 닫기
  const closeModal = () => {
    setRegistModalOpen(false);
    searchMemberList();
  };

  /* 사원 삭제 */

  const deleteMember = async () => {
    if (checked.length === 0) {
      alert("삭제할 회원을 선택하세요.");
      return;
    }

    if (confirm("선택한 회원을 삭제하시겠습니까?")) {
      try {
        const res = await axios.post("/api/admin/deleteMember", {
          id: checked,
        });
        if (res.data.success) {
          alert("삭제되었습니다.");
          setChecked([]);
          searchMemberList();
        } else {
          throw new Error("삭제 실패");
        }
      } catch (err) {
        console.error("삭제 실패:", err);
      }
    }
  };

  /* 수정 팝업 열기 + 사원 정보 */
  const editMember = async () => {
    if (checked.length !== 1) {
      alert("하나만 선택해주세요.");
      return;
    }

    try {
      const res = await axios.post("/api/admin/getMemberInfo", { id: checked });
      if (res.data.success) {
        setEditModalOpen(true);
        setEditMemberData(res.data.member);
      }
    } catch (err) {
      console.error("회원 정보 불러오기 실패:", err);
    }
  };

  // 수정 팝업 닫기
  const onCloseEditModal = () => {
    setEditModalOpen(false);
    setEditMemberData(null);
    searchMemberList();
  };

  return (
    <div className="record-page">
      <div className={adminMemberStyle["record-container"]}>
        <div className={adminMemberStyle["record-card"]}>
          {/* 검색 영역 */}
          <div className={adminMemberStyle["search-area"]}>
            <div className={adminMemberStyle["search-group"]}>
              <div className={adminMemberStyle["search-field"]}>
                <select
                  value={searchType}
                  onChange={(e) => setSearchType(e.target.value)}
                >
                  <option value="all">전체</option>
                  <option value="name">이름</option>
                  <option value="memberNo">사원번호</option>
                  <option value="role">직책</option>
                </select>
              </div>
              <div className={adminMemberStyle["search-field"]}>
                <input
                  type="text"
                  className="custom-input"
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                ></input>
              </div>
              <div className={adminMemberStyle["search-btn-area"]}>
                <button onClick={searchMemberList}>검색</button>
              </div>
            </div>
          </div>
          {/* 버튼 영역 */}
          <div className={adminMemberStyle["btn-area"]}>
            <button onClick={() => registMember()}>등록</button>
            <button onClick={deleteMember}>삭제</button>
            <button onClick={editMember}>수정</button>
          </div>

          {/* 회원 목록 테이블 */}
          <div className={adminMemberStyle["member-table-container"]}>
            <table className={adminMemberStyle["member-table"]}>
              <colgroup>
                <col style={{ width: "5%" }} />
                <col style={{ width: "15%" }} />
                <col style={{ width: "17%" }} />
                <col style={{ width: "14%" }} />
                <col style={{ width: "17%" }} />
                <col style={{ width: "16%" }} />
                <col style={{ width: "16%" }} />
              </colgroup>
              <thead>
                <tr>
                  <th>
                    <input
                      type="checkbox"
                      onChange={(e) => {
                        if (e.target.checked) {
                          const allIds = members.map((m) => m.member_id);
                          setChecked(allIds);
                        } else {
                          setChecked([]);
                        }
                      }}
                    />
                  </th>
                  <th>이름</th>
                  <th>사원번호</th>
                  <th>직책</th>
                  <th>우궁/좌궁</th>
                  <th>평균시수</th>
                  <th>월별보기</th>
                </tr>
              </thead>
              <tbody>
                {members.map((m) => (
                  <tr key={m.member_id}>
                    <td>
                      <input
                        type="checkbox"
                        checked={checked.includes(m.member_id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setChecked((prev) => [...prev, m.member_id]);
                          } else {
                            setChecked((prev) =>
                              prev.filter((id) => id !== m.member_id)
                            );
                          }
                        }}
                      />
                    </td>
                    <td>{m.name}</td>
                    <td>{m.member_no}</td>
                    <td>{m.role}</td>
                    <td>{m.handle}</td>
                    <td>{m.avg_score?.toFixed(2) ?? "-"}</td>
                    <td>
                      <button>
                        <BiDetail size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      {registModalOpen && <RegistModal onClose={closeModal} />}
      {editModalOpen && (
        <EditModal member={editMemberData} onClose={onCloseEditModal} />
      )}
    </div>
  );
}

export default AdminMember;
