const express = require("express");
const router = express.Router();
const pool = require("./db");
const { format } = require("date-fns"); // npm install date-fns

router.post("/getMemberScore", async (req, res) => {
    const { id, date } = req.body;
    try {
      const result = await pool.query(
        `select member_id, record_sun, record_1, record_2, record_3, record_4, record_5, 
        (record_1+record_2+record_3+record_4+record_5) as totalScore, to_char(record_date, 'YYYY-MM-dd') 
        from member_score where member_id = $1 and record_date = $2`,
        [id, date]
      );
  
      res.json({ success: true, result: result.rows });
    } catch (err) {
      console.error("DB 오류:", err);
      res.status(500).json({ success: false, message: "서버 오류" });
    }
  
  })

router.post("/saveUserRecord", async (req, res) => {
  const { data, member_id } = req.body;
  const { date, records } = data;

  try {
    for (const record of records) {
      const round = parseInt(record.round);  // "1" → 1
      const score = parseInt(record.score);
      const [r1, r2, r3, r4, r5] = record.shots.map(s => (s === "中" ? 1 : 0));

      // 먼저 존재하는지 확인
      const existing = await pool.query(
        `SELECT * FROM member_score WHERE member_id = $1 AND record_sun = $2 AND record_date = $3`,
        [member_id, round, date]
      );

      if (existing.rows.length > 0) {
        // 업데이트
        await pool.query(
          `UPDATE member_score
           SET record_1 = $1, record_2 = $2, record_3 = $3, record_4 = $4, record_5 = $5
           WHERE member_id = $6 AND record_sun = $7 AND record_date = $8`,
          [r1, r2, r3, r4, r5, member_id, round, date]
        );
      } else {
        // 삽입
        await pool.query(
          `INSERT INTO member_score (member_id, record_sun, record_date, record_1, record_2, record_3, record_4, record_5)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [member_id, round, date, r1, r2, r3, r4, r5]
        );
      }
    }

    res.json({ success: true });
  } catch (err) {
    console.error("❌ 저장 오류:", err);
    res.status(500).json({ success: false, message: "DB 오류" });
  }
});

router.post("/saveCalendar", async (req, res) => {
    const { memberId, title, startDate, endDate, selectedColor } = req.body;
    
    try {
      const dateKey = format(new Date(startDate), "yyyyMMdd");

      // const exsistCnt = await pool.query(
      //   `SELECT COUNT(*) FROM calendar
      //   WHERE member_id = $1 AND start_date = $2`,
      //   [memberId, dateKey]
      // )
      // const count = parseInt(exsistCnt.rows[0].count);
      // const newId = `${dateKey}_${count + 1}`;

      const result = await pool.query(
        `insert into calendar 
        (cal_id, member_id, start_date, end_date, cal_title, cal_color) 
        values (nextval('cal_seq'), $1, $2, $3, $4, $5)`,
        [memberId, startDate, endDate, title, selectedColor]
      );
  
      res.json({ success: true});
    } catch (err) {
      console.error("DB 오류:", err);
      res.status(500).json({ success: false, message: "서버 오류" });
    }
  })

  router.post("/getScheduleInfo", async (req, res) => {
    const { memberId, startDate } = req.body;

    const startDateMM = format(new Date(startDate), "yyyy-MM");

    try {
      const result = await pool.query(
        `select 
          cal_id, 
          member_id, 
          to_char(start_date, 'YYYY-MM-dd') as start_date, 
          to_char(end_date, 'YYYY-MM-dd') as end_date, 
          cal_title, 
          cal_color 
        from
          calendar
        where
          member_id = $1
          and to_char(start_date, 'YYYY-MM') = $2`,
        [memberId, startDateMM]
      );
  
      res.json({ success: true, result: result.rows });
    } catch (err) {
      console.error("DB 오류:", err);
      res.status(500).json({ success: false, message: "서버 오류" });
    }
  
  })

  router.put("/modifyCalendar", async (req, res) => {
    const { id, title, startDate, endDate, selectedColor } = req.body;

    try {
      await pool.query(
        `UPDATE calendar
         SET cal_title = $1, start_date = $2, end_date = $3, cal_color = $4
         WHERE cal_id = $5`,
        [title, startDate, endDate, selectedColor, id]
      );
      res.json({ success: true });
    } catch (err) {
      console.error("수정 실패:", err);
      res.status(500).json({ success: false });
    }
  
  })

  router.delete("/deleteCalendar", async (req, res) => {
    const { id } = req.body; // 또는 req.query.id 도 가능
    console.log(id)
    try {
      await pool.query(`DELETE FROM calendar WHERE cal_id = $1`, [id]);
      res.json({ success: true });
    } catch (err) {
      console.error("삭제 오류:", err);
      res.status(500).json({ success: false });
    }
  });

  router.post("/getStatData1", async (req, res) => {
    const { memberId, start, end, formattedList } = req.body;
  
    console.log(memberId, start, end, formattedList)
    console.log()
  
    let subAvg = '';
    let subSum = '';
    for(let i=0; i<formattedList.length; i++){
      
      subAvg += `,coalesce(sum(case when TO_CHAR(record_date, 'YYYY-MM') = '${formattedList[i]}' then (record_1 + record_2 + record_3 + record_4 + record_5) else null end)::float /
                        SUM(case when TO_CHAR(record_date, 'YYYY-MM') = '${formattedList[i]}' then 1 else 0 end), 0) as "${formattedList[i]}"`;

      subSum += `,sum(case when record_date = '${formattedList[i]}' then 1 else 0 end) as "${formattedList[i]}"`
    }  
  

    const query = `
      (select
        '평균시수' as label
        ${subAvg}
        from
            member_score
          where
            record_date between $2 and $3
            and member_id = $1)
        union all
      (select
        '습사량' as label
        ${subSum}
        from (	
          select 
            TO_CHAR(record_date, 'YYYY-MM') as record_date
          from 
            member_score
          where
            record_date between $2 and $3
            and member_id = $1
          group by
            record_date))
    `;
  
    console.log(query);
    try{
      const result = await pool.query(query, [memberId, start, end ]);
      const table = await pool.query(`select
                    member_id,
                    TO_CHAR(record_date, 'YYYY-MM-dd') as record_date,
                    count(*) as round_count,
                    sum (record_1 + record_2 + record_3 + record_4 + record_5) as total_hit,
                    ROUND((SUM(record_1 + record_2 + record_3 + record_4 + record_5)::float / COUNT(*))::numeric, 2) as avg_hit
                  from
                     member_score 
                  where member_id = $1 and record_date between $2 and $3
                  group by member_id, record_date
                  order by record_date ` , [memberId, start, end ])
  
      res.json({ success: true, list: result.rows, table:table.rows });
    }catch(err){
      console.error("실패:", err); 
      res.status(500).json({ message: "서버 오류" });
    }
  })

  module.exports = router;