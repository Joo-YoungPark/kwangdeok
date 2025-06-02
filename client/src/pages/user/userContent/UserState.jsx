import React, { useCallback, useEffect, useState } from "react";
import styles from "./UserStat.module.css";
import axios from "axios";
import { Line } from "react-chartjs-2";
import "chart.js/auto";

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

function UserStat() {
  const now = new Date();

  // 초기 기간 설정
  const [fullYearMonthList, setFullYearMonthList] = useState([]);
  // 검색용 기간
  const [yearMonthList, setYearMonthList] = useState([]);

  const [avgScoreDate, setAvgScoreData] = useState([]); // 평균 시수
  const [practiceDays, setPracticeDays] = useState([]); // 습사 일수

  const [tableData, setTableData] = useState([]);

  const formatYearMonth = (date) => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    // const day = date.getDate().toString().padStart(2, "0");
    return `${year}년 ${month}월`;
  };

  const parseYearMonth = (str) => {
    const [yearStr, monthStr] = str.split("년 ");
    const year = parseInt(yearStr);
    const month = parseInt(monthStr.replace("월", ""));
    return new Date(year, month - 1, 1); // 월은 0부터 시작
  };

  const toDateYearMonth = (str) => {
    const [yearStr, monthStr] = str.split("년 ");
    const year = yearStr.trim();
    const month = monthStr.replace("월", "").padStart(2, "0").trim();
    return `${year}-${month}`;
  };

  const [startDate, setStartDate] = useState(
    formatYearMonth(new Date(now.getFullYear(), now.getMonth() - 5, 1))
  );
  const [endDate, setEndDate] = useState(
    formatYearMonth(new Date(now.getFullYear(), now.getMonth() + 1, 0))
  );

  useEffect(() => {
    const list = [];
    const start = new Date(now.getFullYear() - 1, now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const current = new Date(start);
    while (current <= end) {
      list.push(formatYearMonth(new Date(current)));
      current.setMonth(current.getMonth() + 1);
    }
    setFullYearMonthList(list);
    setDateRange();
  }, [startDate, endDate]);

  const setDateRange = () => {
    const result = [];

    const current = parseYearMonth(startDate);
    const end = parseYearMonth(endDate);
    while (current <= end) {
      result.push(formatYearMonth(new Date(current)));
      current.setMonth(current.getMonth() + 1);
    }

    if (result.length < 2) {
      alert("최소 2개월은 선택해주세요");
      return;
    }
    setYearMonthList(result);
  };

  useEffect(() => {
    displayChart1();
  }, [yearMonthList]);

  const displayChart1 = useCallback(async () => {
    const formattedList = yearMonthList.map(toDateYearMonth);
    if (!formattedList.length || !formattedList[0]) return;
    const start = formattedList[0] + "-01";
    var end = formattedList[formattedList.length - 1];
    end = new Date(end);
    end = new Date(end.getFullYear(), end.getMonth() + 1, 0);
    end =
      end.getFullYear() +
      "-" +
      ("0" + (end.getMonth() + 1)).slice(-2) +
      "-" +
      end.getDate();

    try {
      const res = await axios.post("/api/user/getStatData1", {
        memberId: localStorage.getItem("member_id"),
        formattedList,
        start,
        end,
      });
      if (res.data.success) {
        console.log(res.data.table);
        const result1 = [];
        const result2 = [];
        for (let i = 0; i < res.data.list.length; i++) {
          const val = res.data.list[i];

          for (let y = 0; y < formattedList.length; y++) {
            if (val.label === "평균시수") {
              result1.push(val[formattedList[y]]);
            } else if (val.label === "습사량") {
              result2.push(val[formattedList[y]]);
            }
          }
        }
        setAvgScoreData(result1);
        setPracticeDays(result2);
        setTableData(res.data.table);
      }
    } catch (err) {
      console.error("회원 정보 불러오기 실패:", err);
    }
  }, [yearMonthList]);

  const selectStartDate = (e) => {
    setStartDate(e.target.value);
  };
  const selectEndDate = (e) => {
    setEndDate(e.target.value);
  };
  return (
    <div className={styles["stat_page"]}>
      <div className={styles["stat_container"]}>
        <div className={styles["stat_header"]}>
          <span>기간 : </span>
          <select value={startDate} onChange={selectStartDate}>
            {fullYearMonthList.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
          <span>~</span>
          <select value={endDate} onChange={selectEndDate}>
            {fullYearMonthList.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>
        <div className={styles["stat_content"]}>
          <div className={styles["stat_chartArea"]}>
            <div className={styles["stat_chart1"]}>
              <Line
                datasetIdKey="id"
                data={{
                  labels: yearMonthList, // 예: ['2024년 06월', '2024년 07월', ...]
                  datasets: [
                    {
                      id: 1,
                      label: "평균시수",
                      data: avgScoreDate, // 예: [5.1, 6.0, 4.8, ...]
                      borderColor: "rgba(75, 192, 192, 1)",
                      backgroundColor: "rgba(75, 192, 192, 0.2)",
                    },
                    {
                      id: 2,
                      label: "습사량",
                      data: practiceDays, // 예: [3, 5, 2, ...]
                      borderColor: "rgba(255, 99, 132, 1)",
                      backgroundColor: "rgba(255, 99, 132, 0.2)",
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  devicePixelRatio: 2, // 디폴트보다 더 선명하게
                  plugins: {
                    legend: {
                      position: "top",
                      labels: {
                        font: {
                          size: 18,
                          weight: 600,
                        },
                      },
                    },
                    title: {
                      display: true,
                      text: "월별 평균시수 및 습사량 통계",
                      font: {
                        size: 30,
                      },
                    },
                    tooltip: {
                      bodyFont: {
                        size: 16, // 툴팁 안의 폰트 크기
                      },
                      titleFont: {
                        size: 16,
                      },
                      enabled: true,
                      mode: "index",
                      intersect: false,
                      callbacks: {
                        label: function (context) {
                          const label = context.dataset.label || "";
                          const value = context.formattedValue;

                          if (label === "습사량") {
                            return `${label}: ${value}일`;
                          } else if (label === "평균시수") {
                            return `${label}: ${value}`;
                          } else {
                            return `${label}: ${value}`;
                          }
                        },
                      },
                    },
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      title: {
                        display: false,
                      },
                      ticks: {
                        font: {
                          size: 15, // y축 라벨 폰트 크기
                        },
                      },
                    },
                    x: {
                      ticks: {
                        font: {
                          size: 16, // x축 라벨 폰트 크기
                          weight: 500,
                        },
                      },
                    },
                  },
                }}
              />
            </div>
            <div className={styles["stat_chart2"]}>
              <table className={styles["chart2_table"]}>
                <colgroup>
                  <col style={{ width: "40%" }} />
                  <col style={{ width: "20%" }} />
                  <col style={{ width: "20%" }} />
                  <col style={{ width: "20%" }} />
                </colgroup>
                <thead>
                  <tr>
                    <th>습사일자</th>
                    <th>습사량(순)</th>
                    <th>관중</th>
                    <th>평시수</th>
                  </tr>
                </thead>
                <tbody>
                  {tableData.map((m) => (
                    <tr key={m.memberId}>
                      <td>{m.record_date}</td>
                      <td>{m.round_count}</td>
                      <td>{m.total_hit}</td>
                      <td>{m.avg_hit}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserStat;
