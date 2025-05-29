import React, { useEffect, useState } from "react";
import userRecordStyle from "./UserRecord.module.css";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { ko } from "date-fns/locale";
import axios from "axios";
import { format } from "date-fns";

function UserRecord() {
  const [startDate, setStartDate] = useState(new Date());

  const [rows, setRows] = useState([]);

  /* 사용자 오늘의 시수 */
  useEffect(() => {
    getMemberScore(startDate);
  }, [startDate]);

  const getMemberScore = async (startDate) => {
    try {
      const res = await axios.post("/api/user/getMemberScore", {
        id: localStorage.getItem("member_id"),
        date: format(startDate, "yyyy-MM-dd"),
      });

      if (res.data.success) {
        console.log("성공");
        displayScoreTable(res.data.result);
      } else {
        console.log("실패", res.data);
      }
    } catch (err) {
      console.error("에러 발생:", err);
    }
  };

  /* 사용자 시수 테이블 적용 */
  const displayScoreTable = (list) => {
    const wrapped = Array.isArray(list) ? list : [list];

    const newRows = wrapped.map((item, idx) => {
      const shots = [
        item.record_1 === 1 ? "中" : "✗",
        item.record_2 === 1 ? "中" : "✗",
        item.record_3 === 1 ? "中" : "✗",
        item.record_4 === 1 ? "中" : "✗",
        item.record_5 === 1 ? "中" : "✗",
      ];
      return {
        round: `${idx + 1}巡`,
        shots,
        score: `${item.totalscore}中`,
      };
    });
    setRows(newRows);
  };

  const changeDate = (date) => {
    getMemberScore(format(date, "yyyy-MM-dd"));
  };

  /* 행 추가 */
  const addRow = () => {
    setRows((prevRows) => {
      if (prevRows.length === 0) {
        return [
          {
            round: "1巡",
            shots: ["", "", "", "", ""],
            score: "中",
          },
        ];
      }

      const updatedRows = [...prevRows];

      // 마지막 행 가져오기
      const lastRowIdx = updatedRows.length - 1;
      const lastRow = updatedRows[lastRowIdx];

      // 빈칸("")이면 "."으로 바꾸기
      const updatedLastShots = lastRow.shots.map((shot) =>
        shot === "" ? "✗" : shot
      );
      const updatedLastScore = updatedLastShots.filter(
        (shot) => shot === "中"
      ).length;

      // 기존 행 업데이트
      updatedRows[lastRowIdx] = {
        ...lastRow,
        shots: updatedLastShots,
        score: updatedLastScore + "中",
      };

      // 새 행 추가
      const newRow = {
        round: `${updatedRows.length + 1}巡`,
        shots: ["", "", "", "", ""],
        score: 0,
      };

      return [...updatedRows, newRow];
    });
  };

  const countTotalHits = (rows) =>
    rows.reduce(
      (sum, row) => sum + row.shots.filter((s) => s === "中").length,
      0
    );

  const totalScore = countTotalHits(rows);
  const totalArrows = rows.length * 5;
  const avgScore = rows.length > 0 ? (totalScore / rows.length).toFixed(1) : 0;

  /* 셀 클릭 시 관중 (中) 표시 (토글) (*/
  const cellClick = (rowIdx, colIdx) => {
    console.log(`Clicked cell - Row: ${rowIdx + 1}, Column: ${colIdx}`);
    setRows((prevRows) =>
      prevRows.map((row, rIdx) => {
        if (rIdx !== rowIdx) return row;

        const newShots = row.shots.map((val, cIdx) =>
          cIdx === colIdx ? (val === "中" ? "✗" : "中") : val
        );

        const newScore = newShots.filter((shot) => shot === "中").length;
        return {
          ...row,
          shots: newShots,
          score: newScore + "中",
        };
      })
    );
  };

  const saveRecord = async () => {
    const data = {
      date: format(startDate, "yyyy-MM-dd"), // 선택한 날짜
      totalScore,
      totalArrows,
      avgScore,
      records: rows.map((row) => ({
        round: row.round.replace("巡", ""),
        shots: row.shots,
        score: row.score.replace("中", ""),
      })),
    };

    console.log(data);
    if (localStorage.getItem("member_id") === null) {
      alert("로그인 정보가 없습니다. 다시 로그인해주세요.");
      return;
    }

    try {
      const res = await axios.post("/api/user/saveUserRecord", {
        data,
        member_id: localStorage.getItem("member_id"),
      });
      if (res.data.success) {
        alert("저장되었습니다.");
        setStartDate(new Date());
      }
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className={userRecordStyle["record-page"]}>
      <div className={userRecordStyle["record-container"]}>
        <div className={userRecordStyle["record-date"]}>
          <span>📝 습사기록 : </span>
          <div className={userRecordStyle["record-datepicker-wapper"]}>
            <DatePicker
              selected={startDate}
              dateFormat="yyyy-MM-dd"
              onChange={(date) => {
                changeDate(date);
                setStartDate(date);
              }}
              locale={ko}
              className="custom-input"
              maxDate={new Date()}
              calendarClassName="custom-calendar"
            />
          </div>
        </div>
        <div className={userRecordStyle["record-stat"]}>
          <p>
            🧮 총시수:{" "}
            <strong>
              {" "}
              {totalScore}中 / {totalArrows}矢
            </strong>
          </p>
          <p>
            📊 평: <strong>{avgScore}中</strong>
          </p>
        </div>
        <div className={userRecordStyle["record-save"]}>
          <button className="btn" onClick={saveRecord}>
            저장
          </button>
        </div>
      </div>

      {/* 기록 테이블 */}
      <div className={userRecordStyle["table-container"]}>
        <table className={userRecordStyle["record-table"]}>
          <thead>
            <tr>
              <th>항목</th>
              <th>1矢</th>
              <th>2矢</th>
              <th>3矢</th>
              <th>4矢</th>
              <th>5矢</th>
              <th>巡點</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td colSpan={7}>데이터 없음</td>
              </tr>
            )}
            {rows.map((row, rowIdx) => (
              <tr key={rowIdx}>
                <td>{row.round}</td>
                {row.shots.map((shot, colIdx) => (
                  <td key={colIdx} onClick={() => cellClick(rowIdx, colIdx)}>
                    {shot}
                  </td>
                ))}
                <td style={{ color: "red" }}>{row.score}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className={userRecordStyle["plusTable"]}>
          <button
            className={userRecordStyle["plusTableBtn"]}
            onClick={addRow}
            style={{ marginTop: "20px", padding: "10px 20px" }}
          >
            +
          </button>
        </div>
      </div>
    </div>
  );
}

export default UserRecord;
