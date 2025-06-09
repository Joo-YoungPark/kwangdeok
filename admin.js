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
    res.status(500).json({ message: "사원 이름 로딩에 실패했습니다. 새로고침 해주세요." });
  }
})

// 편사 기록 저장
router.post("/saveRecord", async (req, res) => {
  const { date, year, month, day, searchName, avg, memberId } = req.body;
  
  if (!year || !month || !day || !searchName || !avg || !memberId) {
    return res.status(400).json({ message: "입력값 부족" });
  }

  try {
    const result = await pool.query(
      `INSERT INTO game_score (member_id, game_date, g_year, g_month, g_day, avg_score)
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (member_id, game_date)
      DO UPDATE
      SET avg_score = ROUND(((game_score.avg_score + EXCLUDED.avg_score) / 2)::numeric, 2);`,
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
                    useYn,
                    COALESCE((SELECT ROUND(AVG(avg_score)::numeric, 2) FROM game_score b WHERE a.member_id = b.member_id AND g_year = 2025), 0) AS avg_score, 
                    role
              FROM member a
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

  if (!name || !handle || !role || !memberNo) {
    return res.status(400).json({ message: "필수 항목이 누락됐습니다. 확인해주세요." });
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
    if (err.code === "23505") {
      // unique_violation
      return res
        .status(409)
        .json({ success: false, message: "이미 존재하는 사원번호입니다." });
    } else if (err.code === "23514") {
      // check_violation (e.g., handle 제약 조건)
      return res
        .status(400)
        .json({ success: false, message: "유효하지 않은 값이 포함되어 있습니다." });
    } else if (err.code === "22P02") {
      // invalid_text_representation (형변환 오류 등)
      return res
        .status(400)
        .json({ success: false, message: "입력 형식이 잘못되었습니다." });
    }

    res
      .status(500)
      .json({ success: false, message: "회원등록 중 오류가 발생했습니다." });
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
    res.status(500).json({ message: "삭제 중 오류가 발생했습니다. 다시 시도해주세요." });
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
      `SELECT member_id, member_no, name, role, useYn, handle FROM member WHERE member_id = $1`,
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
  const { id, memberNo, name, role, handle, useyn } = req.body;
  
  if (!id || !name || !role || !memberNo || !useyn) {
    return res.status(400).json({ success: false, message: "필수 항목 누락" });
  }
  try {
    const result = await pool.query(
      `UPDATE MEMBER SET name = $1,
           role = $2,
           handle = $3,
           member_no = $4,
           update_date = NOW(),
           useyn = $5
       WHERE member_id = $6`,
      [name, role, handle, memberNo, useyn, id]

    );

    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, message: "회원정보가 존재하지 않습니다." });
    }

    res.json({ success: true, message: "회원 수정이 완료되었습니다." });
  } catch (err) {
    if (err.code === "23505") {
      return res.status(409).json({ success: false, message: "중복된 데이터입니다." });
    }

    return res.status(500).json({ success: false, message: "서버 내부 오류" });
  }
})

// 사원 월별 시수
router.post("/getMonthScore", async (req, res) => {
  const { id, yearRange } = req.body;

  let month = "";
  let monthList = [2024, 2025];

  for(let i=yearRange[0]; i<=yearRange[yearRange.length-1]; i++){
    month += `, COALESCE(ROUND(AVG(avg_score::numeric) FILTER (WHERE g_year = ${i}), 2), 0) AS "${i}"`;
  }  

  const query = `
    SELECT
      concat(cast(m as text) || '월') AS "month"
      ${month}
    FROM (
      SELECT g_year, g_month, avg_score
      FROM game_score
      WHERE member_id = $1
    ) AS gs
     RIGHT JOIN GENERATE_SERIES(1, 12) AS m(g_month) ON gs.g_month = m
    GROUP BY m
    ORDER BY m;
  `;

  try{
    const result = await pool.query(query, [id]);

    res.json({ success: true, list: result.rows });
  }catch(err){
    console.error("오류");
    res.status(500).json({ message: "서버 오류" });
  }
})

// 편사기록 > 해당 날짜 시수 기록 모두 불러오기기
router.post("/getTodaysRecord", async (req, res) => {
  const { date } = req.body;

  try {
    const result = await pool.query(
      `select
        member_id,
        (select name from member b where a.member_id = b.member_id ) as name,
        to_char(game_date, 'yyyy-MM-dd') as game_date,
        avg_score
      from
        game_score a
      where
        game_date::date = $1`, [date]);

    res.json({ success: true, result: result.rows});
  } catch (err) {
    console.error("오류:", err);
    res.status(500).json({ success: false, message: "DB 오류" });
  }
});

// 사원 시수 기록 삭제
router.delete("/deleteGameScore", async (req, res) => {
    const { id, date } = req.body; // 또는 req.query.id 도 가능
    try {
      await pool.query(`delete from game_score where game_date = $1 and member_id = $2`, [date, id]);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ success: false, message: "DB 오류" });
    }
  });
module.exports = router;