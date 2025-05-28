import React, { useRef, useState } from "react";

import adminRecordStyle from "./AdminRecord.module.css";
import "react-datepicker/dist/react-datepicker.css";
import DatePicker from "react-datepicker"; // npm install react-datepicker
import { format } from "date-fns"; // npm install date-fns
import { ko } from "date-fns/locale";

function AdminRecord() {
  const [date, setDate] = useState(new Date());
  const [searchName, setSearchName] = useState("");
  const [score, setScore] = useState("");
  const inputRef = useRef(null);

  /* 시수에는 1~5 숫자만 입력되도록함 */
  const onlyNumber = (e) => {
    var value = e.target.value;
    value = value.replace(/[^0-5.]/g, "").replace(/(\..*)\./g, "$1");
    setScore(value);
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
              />
            </div>
          </div>

          <div className={adminRecordStyle["record-score"]}>
            <span>📝 시수 : </span>
            <div className="record-input-wapper" style={{ width: "40%" }}>
              <input
                value={score}
                type="text"
                onChange={onlyNumber}
                maxLength={1}
                className="custom-input"
                ref={inputRef}
                style={{ width: "6vw" }}
              />
              <button type="submit"> 입력 </button>
            </div>
          </div>

          <div className={adminRecordStyle["record-avgScore"]}>
            <span>📝 평균 시수 : </span>
            <div className="record-input-wapper" style={{ width: "40%" }}>
              <p>평균값</p>
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
                <tbody></tbody>
              </table>
            </div>
          </div>
          <div className={adminRecordStyle["score-btn-area"]}>
            <button className="btn">저장</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminRecord;
