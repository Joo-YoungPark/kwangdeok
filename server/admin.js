const express = require("express");
const router = express.Router();
const pool = require("./db");
const bcrypt = require("bcrypt");


router.get("/getMembersName", async(req, res) => {
  
  try{
    const result = await pool.query(
      `select member_id, member_no, name from member where useyn != 'N' and member_no != '000000' order by member_id`
    )

    res.json({ success: true, members: result.rows });
  }catch(err){
    console.error("오류");
    res.status(500).json({ message: "서버 오류" });
  }
})


router.post("/saveRecord", async (req, res) => {
  const { date, year, month, day, searchName, avg, memberId } = req.body;
  
  console.log(date, year, month, day, searchName, avg, memberId)
  if (!year || !month || !day || !searchName || !avg || !memberId) {
    return res.status(400).json({ message: "입력값 부족" });
  }
  try {
    const result = await pool.query(
      `insert into game_score  
      (member_id, game_date, g_year, g_month, g_day, avg_score ) 
      values ($1, $2, $3, $4, $5, $6)`,
      [memberId, date, year, month, day, avg]

    );

    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, message: "회원 없음" });
    }

    res.json({ success: true });
  } catch (err) {
    console.error("수정 오류:", err);
    res.status(500).json({ message: "서버 오류" });
  }
})

module.exports = router;