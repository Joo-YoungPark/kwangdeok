require("dotenv").config();
const express = require('express');
const cors = require('cors');
const pool = require("./db");
const bcrypt = require("bcrypt");
const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
  origin: 'https://kwangdeok-client.cloudtype.app',
  credentials: true
}));
app.use(express.json());

// admin 라우터 추가
const adminRouter = require("./admin"); 
app.use("/api/admin", adminRouter); 

// user 라우터 추가
const userRouter = require("./user"); 
app.use("/api/user", userRouter); 

app.get('/api/test', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({ time: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).send('DB 연결 실패');
  }
});


// 로그인
app.post('/api/login', async (req, res) => {
    const { id, password } = req.body;
  
    try {
      const result = await pool.query(
        "SELECT * FROM member WHERE name = $1",
        [id]
      );
  
      if (result.rows.length === 0) {
        return res.status(401).json({ message: "존재하지 않는 회원입니다." });
      }
  
      const user = result.rows[0];
  
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ message: "비밀번호가 일치하지 않습니다." });
      }
  
      res.json({
        success: true,
        token: "dummy.jwt.token", // 실제 배포 시 JWT 발급 권장
        id : user.member_id,
        role: user.role,
        memberNo : user.member_no,
        name: user.name,
        isFirstLogin: user.is_first_login,
      });
      
      
    } catch (err) {
      console.error("로그인 오류:", err);
      return res.status(500).json({ success: false, message: "서버 오류" });
    }
  });

  app.post("/api/changePw", async (req, res) => {
  const { memberId, newPassword } = req.body;

  if (!memberId || !newPassword) {
    return res.status(400).json({ message: "입력값 부족" });
  }

  try {
    const hashed = await bcrypt.hash(newPassword, 10);
    await pool.query(
      `UPDATE member SET password = $1, is_first_login = false WHERE member_id = $2`,
      [hashed, memberId]
    );

    res.json({ success: true });
  } catch (err) {
    console.error("비밀번호 변경 오류:", err);
    res.status(500).json({ message: "서버 오류" });
  }
});

app.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
  });
  