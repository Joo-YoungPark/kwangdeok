import React, { useEffect, useState } from "react";
import styles from "./MonthDataPop.module.css";
import axios from "axios";
import "react-datepicker/dist/react-datepicker.css";

const MonthDataPop = ({ data, onClose }) => {
  const [startYear, setStartYear] = useState(2024);
  const [endYear, setEndYear] = useState(2025);
  const [yearRange, setYearRange] = useState([]);
  const [monthData, setMonthData] = useState([]);

  const thisYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 4 }, (_, i) => thisYear - i);

  const selectStartYear = (e) => {
    setStartYear(Number(e.target.value));
  };
  const selectEndYear = (e) => {
    setEndYear(Number(e.target.value));
  };

  useEffect(() => {
    const list = [];

    if (endYear < startYear) {
      alert("종료 연도는 시작 연도와 같거나 이후여야 합니다.");
    }
    for (let i = startYear; i <= endYear; i++) {
      list.push(i);
    }
    setYearRange(list);
  }, [startYear, endYear]);

  useEffect(() => {
    if (yearRange.length > 0) {
      getMonthData();
    }
  }, [yearRange]);

  const getMonthData = async () => {
    try {
      const res = await axios.post("/api/admin/getMonthScore", {
        id: data.id,
        yearRange,
      });
      if (res.data.success) {
        console.log(res.data.list);
        setMonthData(res.data.list);
      }
    } catch (err) {
      console.error("회원 정보 불러오기 실패:", err);
    }
  };
  return (
    <div className={styles["backdrop"]}>
      <div className={styles["modal"]}>
        <div className={styles["modal-container"]}>
          <div className={styles["modal-header"]}>
            <div className={styles["year-picker"]}>
              <span>기간 : </span>
              <select
                value={startYear}
                // onChange={(e) => setStartYear(Number(e.target.value))}
                onChange={selectStartYear}
              >
                {yearOptions.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
              <span>~</span>
              <select
                value={endYear}
                // onChange={(e) => setEndYear(Number(e.target.value))}
                onChange={selectEndYear}
              >
                {yearOptions.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
            <button className={styles["close-button"]} onClick={onClose}>
              ×
            </button>
          </div>
          <div className={styles["modal-contents"]}>
            <table className={styles["month_table"]}>
              <thead>
                <tr>
                  <th>연도</th>
                  {yearRange.map((m) => (
                    <th key={m}>{m}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {monthData.map((row, idx) => (
                  <tr key={idx}>
                    <td>{row.month}</td>
                    {yearRange.map((year) => (
                      <td key={year}>{row[year] ?? "0"}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MonthDataPop;
