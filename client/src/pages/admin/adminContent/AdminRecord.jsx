import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import adminRecordStyle from "./AdminRecord.module.css";
import DatePicker from "react-datepicker"; // npm install react-datepicker
import "react-datepicker/dist/react-datepicker.css";
import "../../../css/Calendar.css";
import { format } from "date-fns"; // npm install date-fns
import { ko } from "date-fns/locale";

function AdminRecord() {
  const [date, setDate] = useState(new Date());
  const [searchName, setSearchName] = useState("");

  const [setMembers] = useState([]);
  const [nameOptions, setNameOptions] = useState([]);
  const [memberId, setMemberId] = useState("");

  const [scores, setScores] = useState([]); // table에 append될 데이터
  const [score, setScore] = useState("");
  const inputRef = useRef(null);

  /* 사원 이름 목록 (사원이름, 사원 번호) */
  useEffect(() => {
    axios
      .get("/api/admin/getMembersName")
      .then((res) => {
        if (res.data.success) {
          setNameOptions(res.data.members);

          return;
        }
      })
      .catch((err) => {
        console.error("사원 이름 로딩 실패:", err);
      });
  }, []);

  /* 시수에는 1~5 숫자만 입력되도록함 */
  const onlyNumber = (e) => {
    var value = e.target.value;
    value = value.replace(/[^0-5.]/g, "").replace(/(\..*)\./g, "$1");
    setScore(value);
  };

  /* 사원이름 onChange */
  const handleNameChange = (e) => {
    const value = e.target.value;
    const nameOnly = value.split(" (사번")[0];

    setSearchName(nameOnly);

    // 이름에 대응하는 member_id 찾아서 저장
    const found = nameOptions.find((m) => m.name === nameOnly);
    if (found) {
      setMemberId(found.member_id);
    } else {
      setMemberId(null); // 일치하는 이름 없으면 초기화
    }
  };

  /* 시수 입력 이벤트 */
  const addScore = () => {
    if (score.trim() === "") return;
    setScores((prev) => [...prev, score]);
    setScore("");
    inputRef.current.focus();
  };

  /* 엔터 클릭 시 시수 입력 */
  const handleSubmit = (e) => {
    e.preventDefault(); // 기본 제출 막기
    addScore(); // 기존 함수 호출
  };

  /* 평균 시수 구하기 */
  const avg =
    scores.length === 0
      ? 0
      : (
          scores.reduce((sum, cur) => sum + parseFloat(cur), 0) / scores.length
        ).toFixed(2);

  /* 시수 삭제 이벤트 */
  const removeRow = (index) => {
    setScores((prev) => prev.filter((_, i) => i !== index));
  };

  /* 시수 저장 버튼 클릭 */
  const saveRecord = async () => {
    if (memberId === null) {
      alert("존재하지 않는 사원입니다.");
      return;
    }
    try {
      await axios.post("/api/admin/saveRecord", {
        date: format(date, "yyyy-MM-dd"),
        year: date.getFullYear(),
        month: date.getMonth() + 1,
        day: date.getDate(),
        searchName,
        avg,
        memberId,
      });
      alert("등록되었습니다.");
      setSearchName("");
      setMemberId("");
      setScore("");
      setScores([]);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="record-page">
      <div className={adminRecordStyle["record-container"]}>
        <div className={adminRecordStyle["record-card"]}>
          <div className={adminRecordStyle["record-date"]}>
            <span>📝 날짜 : </span>
            <div className="record-datepicker-wapper" style={{ width: "40%" }}>
              <DatePicker
                selected={date}
                onChange={(date) => setDate(date)}
                dateFormat="yyyy-MM-dd"
                locale={ko}
                className="custom-input"
                calendarClassName="custom-calendar"
              />
            </div>
          </div>
          <div className={adminRecordStyle["record-name"]}>
            <span>📝 사원이름 : </span>
            <div className="record-input-wapper" style={{ width: "40%" }}>
              <input
                type="text"
                list="memberNameList"
                className="custom-input"
                value={searchName}
                onChange={handleNameChange}
              />
              <datalist id="memberNameList">
                {nameOptions.map((m) => (
                  <option
                    key={m.member_id}
                    // value={`${m.name} (ID: ${m.member_id})`}
                    value={`${m.name} (사번: ${m.member_no})`}
                  />
                ))}
              </datalist>
            </div>
          </div>

          <div className={adminRecordStyle["record-score"]}>
            <span>📝 시수 : </span>
            <div className="record-input-wapper" style={{ width: "40%" }}>
              <form onSubmit={handleSubmit}>
                <input
                  value={score}
                  type="text"
                  onChange={onlyNumber}
                  maxLength={1}
                  className="custom-input"
                  ref={inputRef}
                  style={{ width: "6vw" }}
                />
                <button onClick={addScore} type="submit">
                  {" "}
                  입력{" "}
                </button>
              </form>
            </div>
          </div>

          <div className={adminRecordStyle["record-avgScore"]}>
            <span>📝 평균 시수 : </span>
            <div className="record-input-wapper" style={{ width: "40%" }}>
              <p>{avg}</p>
            </div>
          </div>

          <div className={adminRecordStyle["record-totalScore"]}>
            <div className={adminRecordStyle["record-totalScore-header"]}>
              <table className={adminRecordStyle["record-table"]}>
                <colgroup>
                  <col style={{ width: "20%" }} />
                  <col style={{ width: "50%" }} />
                  <col style={{ width: "30%" }} />
                </colgroup>
                <thead>
                  <tr>
                    <th>순</th>
                    <th>시수</th>
                    <th>삭제</th>
                  </tr>
                </thead>
                <tbody>
                  {scores.map((score, index) => (
                    <tr key={index}>
                      <td>{index + 1}</td>
                      <td>{score}</td>
                      <td>
                        <button onClick={() => removeRow(index)}>삭제</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className={adminRecordStyle["score-btn-area"]}>
            <button className="btn" onClick={saveRecord}>
              저장
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminRecord;
