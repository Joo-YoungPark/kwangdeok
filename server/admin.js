const express = require("express");
const router = express.Router();
const pool = require("./db");
const bcrypt = require("bcrypt");

// 편사 기록 dataList
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

// 편사 기록 저장
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

// 사원 목록
router.get("/getMemberList", async (req, res) => {
  const { searchType, searchKeyword, page = 1, size = 5 } = req.query;

  const offset = (page - 1) * size;
  const limit = parseInt(size);

  let sql = `SELECT member_id, name, member_no,
                    CASE WHEN handle = 1 THEN '우궁'
                         WHEN handle = -1 THEN '좌궁' ELSE '-' END AS handle,
                    avg_score, role
              FROM member
              WHERE 1=1 AND member_no != '000000'`;
  const params = [];

  if(searchType === 'all'){
    sql += "AND (name ILIKE $" + (params.length + 1);
    params.push(`%${searchKeyword}%`)
    sql += " OR member_no ILIKE $" + (params.length + 1);
    params.push(`%${searchKeyword}%`)
    sql += " OR role ILIKE $" + (params.length + 1) + ")";
    params.push(`%${searchKeyword}%`)
  }else if(searchType === 'name'){
    sql += " AND name ILIKE $" + (params.length + 1);
    params.push(`%${searchKeyword}%`);
  }else if(searchType === 'memberNo'){
    sql += " AND member_no ILIKE $" + (params.length + 1);
    params.push(`%${searchKeyword}%`);
  }else if(searchType === 'role'){
    sql += " AND role ILIKE $" + (params.length + 1);
    params.push(`%${searchKeyword}%`);
  }
  
  sql += ` ORDER BY member_id LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
  params.push(limit, offset);

  try {
    const result = await pool.query(sql, params);
    const countResult = await pool.query(`SELECT COUNT(*) FROM member WHERE 1=1 AND member_no != '000000'`);
    const totalCount = parseInt(countResult.rows[0].count);

    res.json({ success: true, members: result.rows, totalCount });
  } catch (err) {
    console.error("회원 목록 조회 오류:", err);
    res.status(500).json({ success: false, message: "DB 오류" });
  }
});

// 사원 등록
router.post("/registMember", async (req, res) => {
  const { memberNo, name, password, role, handle } = req.body;
  console.log("받은 가입 요청:", memberNo, name, password, role, handle);

  if (!name || !handle || !role || !memberNo) {
    return res.status(400).json({ message: "필수 항목 누락" });
  }

  try {
    const hashedPw = await bcrypt.hash(password, 10); // saltRounds = 10
    const result = await pool.query(
      "INSERT INTO member (member_id, member_no, name, password, role, handle) VALUES (nextval('seq_id'), $1, $2, $3, $4, $5) RETURNING *",
      [memberNo, name, hashedPw, role, handle]
    );

    res.json({ success: true, member: result.rows[0] });
  } catch (err) {
    console.error("DB 오류:", err);
    res.status(500).json({ success: false, message: "서버 오류" });
  }
});

// 사원 삭제
router.post("/deleteMember", async (req, res) => {
  const { id } = req.body;
  
  if (!Array.isArray(id) || id.length === 0) {
    return res.status(400).json({ message: "삭제할 ID가 없습니다." });
  }
  try {
    const result = await pool.query(
      `DELETE FROM member WHERE member_id = ANY($1::int[])`,
      [id]
    );

    res.json({ success: true, deletedCount: result.rowCount });
  } catch (err) {
    console.error("삭제 오류:", err);
    res.status(500).json({ message: "서버 오류" });
  }
})

// 사원 정보 
router.post("/getMemberInfo", async (req, res) => {
  const { id } = req.body; // 단일 ID

  const memberId = parseInt(id);
  if (!memberId) {
    return res.status(400).json({ message: "조회할 ID가 없습니다." });
  }

  try {
    const result = await pool.query(
      `SELECT member_id, member_no, name, role, handle FROM member WHERE member_id = $1`,
      [memberId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "해당 회원을 찾을 수 없습니다." });
    }

    res.json({ success: true, member: result.rows[0] });
  } catch (err) {
    console.error("회원 조회 오류:", err);
    res.status(500).json({ message: "서버 오류" });
  }
})

// 사원 정보 수정
router.post("/editMember", async (req, res) => {
  const { id, memberNo, name, role, handle } = req.body;
  
  console.log(id, name, memberNo)
  if (!id || !name || !role || !memberNo) {
    return res.status(400).json({ message: "입력값 부족" });
  }
  try {
    const result = await pool.query(
      `UPDATE MEMBER SET name = $1,
           role = $2,
           handle = $3,
           member_no = $4,
           update_date = NOW()
       WHERE member_id = $5`,
      [name, role, handle, memberNo, id]

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