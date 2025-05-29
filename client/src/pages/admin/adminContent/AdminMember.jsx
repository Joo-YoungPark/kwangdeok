import React, { useEffect, useState } from "react";
import axios from "axios";
import adminMemberStyle from "./AdminMember.module.css";
import { BiDetail } from "react-icons/bi"; // npm install react-icons

function AdminMember() {
  const [searchType, setSearchType] = useState("all");
  const [searchKeyword, setSearchKeyword] = useState("");

  const [members, setMembers] = useState([]);

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
            <button>등록</button>
            <button>삭제</button>
            <button>수정</button>
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
                  <th>체크박스</th>
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
                    <td>체크박스</td>
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
    </div>
  );
}

export default AdminMember;
