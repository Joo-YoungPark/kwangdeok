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


module.exports = router;