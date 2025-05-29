import React, { useEffect, useState } from "react";
import axios from "axios";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
//npm install @fullcalendar/react @fullcalendar/daygrid @fullcalendar/interaction
import interactionPlugin from "@fullcalendar/interaction";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { CirclePicker } from "react-color"; //npm install react-color

import { ko } from "date-fns/locale";
import { addDays, format } from "date-fns";

import userCalendarStyle from "./UserCalendar.module.css";
import "../../../css/Calendar.css";

function UserCalendar() {
  const [calendar, setCalendar] = useState([]);
  const [addScheModalOpen, setAddScheModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [selectedColor, setSelectedColor] = useState("#36c");
  const [modify, setModify] = useState(null);

  useEffect(() => {
    displayCalendar(startDate);
  }, [startDate]);

  /* 사용자 일정  */
  const displayCalendar = async (startDate) => {
    try {
      const res = await axios.post("/api/user/getScheduleInfo", {
        memberId: localStorage.getItem("member_id"),
        startDate: format(startDate, "yyyy-MM-dd"),
      });
      if (res.data.success) {
        const mappedEvents = res.data.result.map((value) => ({
          id: value.cal_id,
          title: value.cal_title,
          start: value.start_date,
          end: format(addDays(new Date(value.end_date), 1), "yyyy-MM-dd"),
          allDay: true,
          color: value.cal_color,
        }));
        setCalendar(mappedEvents);
      }
    } catch (err) {
      console.error(err);
    }
  };

  /* 일정 추가 팝업 오픈 */
  const addSchedulePop = (info) => {
    const clickedDate = new Date(info.dateStr);
    setStartDate(clickedDate);
    setNewTitle("");
    setEndDate(addDays(clickedDate, 3));
    setAddScheModalOpen(true);
    setModify(null);
  };

  /* 일정 추가 */
  const addSchedule = async () => {
    if (!newTitle.trim() || !startDate) {
      return;
    }

    const newEvent = {
      title: newTitle,
      start: startDate,
      end: format(addDays(endDate, 1), "yyyy-MM-dd"),
      allDay: true,
      color: selectedColor,
    };

    setCalendar((prev) => [...prev, newEvent]);
    setNewTitle("");
    setSelectedColor("#36c");
    setAddScheModalOpen(false);

    try {
      const safeEndDate = endDate || startDate;
      const res = await axios.post("/api/user/saveCalendar", {
        memberId: localStorage.getItem("member_id"),
        title: newTitle,
        startDate: format(startDate, "yyyy-MM-dd"),
        endDate: format(safeEndDate, "yyyy-MM-dd"),
        selectedColor,
      });
      if (res.data.success) {
        alert("저장되었습니다.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  /* 일정 수정 팝업 오픈 */
  const modifySchedulePop = (clickInfo) => {
    const event = clickInfo.event;
    const modDay = addDays(new Date(event.end), -1);

    setModify({
      id: event.id,
      title: event.title,
      start: new Date(event.start),
      end: modDay,
      color: event.backgroundColor || event.color || "#36c",
    });

    setNewTitle(event.title);
    setStartDate(new Date(event.start));
    setEndDate(modDay);
    setSelectedColor(event.backgroundColor || event.color || "#36c");
    setAddScheModalOpen(true);
  };

  /* 일정 수정 */
  const modifySchedule = async () => {
    if (!modify) return;

    const modifyEvent = {
      ...modify,
      title: newTitle,
      start: startDate,
      end: addDays(endDate, 1),
      color: selectedColor,
      allDay: true,
    };

    setCalendar((prev) =>
      prev.map((event) => (event.id === modify.id ? modifyEvent : event))
    );

    try {
      const res = await axios.put("/api/user/modifyCalendar", {
        id: modify.id,
        title: newTitle,
        startDate: format(startDate, "yyyy-MM-dd"),
        endDate: format(endDate, "yyyy-MM-dd"),
        selectedColor,
      });
      if (res.data.success) {
        displayCalendar(startDate);
      }
    } catch (err) {
      console.error("수정 실패:", err);
    }

    setModify(null);
    setNewTitle("");
    setAddScheModalOpen(false);
  };

  /* 일정 삭제 */
  const deleteSchedule = async (e) => {
    if (confirm("삭제하시겠습니까?")) {
      try {
        const res = await axios.delete("/api/user/deleteCalendar", {
          data: { id: e.id },
        });

        if (res.data.success) {
          setCalendar((prev) => prev.filter((event) => event.id !== e.id));
          displayCalendar(startDate);
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  /* 일정 색상 선택 */
  const colorChange = (color) => {
    setSelectedColor(color.hex);
    const inputEl = document.querySelector(
      ".react-datepicker__input-container input"
    );
    if (inputEl) inputEl.style.backgroundColor = color.hex;
  };

  return (
    <div className={userCalendarStyle["calendar-page"]}>
      <div style={{ padding: "2rem 0.5rem" }}>
        <FullCalendar
          plugins={[dayGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          dateClick={addSchedulePop}
          events={calendar}
          locale="ko"
          height="auto"
          eventClick={modifySchedulePop}
          dayCellContent={(arg) => arg.dayNumberText.replace("일", "")}
          eventDidMount={(info) => {
            const trash = document.createElement("span");
            trash.innerHTML = "X";
            trash.className = "delete-icon";

            // 클릭 이벤트
            trash.addEventListener("click", (e) => {
              e.stopPropagation(); // 이벤트 전파 방지
              deleteSchedule(info.event);
            });

            const titleEl = info.el.querySelector(".fc-event-title");
            if (titleEl) {
              titleEl.appendChild(trash);
            } else {
              info.el.appendChild(trash);
            }
          }}
        />
      </div>
      {addScheModalOpen && (
        <div className={userCalendarStyle["modal-backdrop"]}>
          <div className={userCalendarStyle["modal"]}>
            <div className={userCalendarStyle["modal-header"]}>
              <input
                type="text"
                className="custom-input"
                placeholder="일정을 입력하세요"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
              />
            </div>
            <div className={userCalendarStyle["modal-colorPicker-container"]}>
              <CirclePicker
                color={selectedColor}
                onChangeComplete={colorChange}
                colors={[
                  "#ffc0bb",
                  "#fcd598",
                  "#f7ffad",
                  "#bbffac",
                  "#99f3ff",
                  "#6ebdfc",
                  "#ffa7fc",
                ]}
              />
            </div>
            <div className="modal-datePicker-container">
              <DatePicker
                locale={ko}
                dateFormat="yyyy-MM-dd"
                selected={startDate}
                onChange={(dates) => {
                  const [start, end] = dates;
                  setStartDate(start);
                  if (end) {
                    setEndDate(end);
                  } else {
                    setEndDate(null);
                  }
                }}
                startDate={startDate}
                endDate={endDate}
                selectsRange
              />
            </div>
            <div className={userCalendarStyle["modal-buttons"]}>
              <button
                className="cencle"
                onClick={() => setAddScheModalOpen(false)}
              >
                취소
              </button>
              <button
                className="btn"
                onClick={modify ? modifySchedule : addSchedule}
              >
                {modify ? "수정" : "추가"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserCalendar;
