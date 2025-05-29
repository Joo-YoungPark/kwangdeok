const express = require("express");
const router = express.Router();
const pool = require("./db");

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


  module.exports = router;