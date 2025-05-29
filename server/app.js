const express = require('express');
const cors = require('cors');
const pool = require("./db");
const bcrypt = require("bcrypt");
const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

// admin 라우터 추가
const adminRouter = require("./admin"); 
app.use("/api/admin", adminRouter); 

// user 라우터 추가
const userRouter = require("./user"); 
app.use("/api/user", userRouter); 

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
      });
      
      
    } catch (err) {
      console.error("로그인 오류:", err);
      return res.status(500).json({ success: false, message: "서버 오류" });
    }
  });

app.listen(port, () => {
    console.log(`✅ Server running on http://localhost:${port}`);
  });
  