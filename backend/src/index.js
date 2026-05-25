/** 서버의 시작점
 * 1. Express 서버 생성
   2. 미들웨어 연결 (cors, dotenv)
   3. DB 연결
   4. 서버 시작 (포트 열기)
 */

// 환경변수 파일(.env) 읽기
require('dotenv').config();

// 패키지 불러오기 (package.json)
const express = require('express');
const cors = require('cors');

// DB 연결 불러오기 (./db/index.js)
const pool = require('./db');

// Express 앱 생성
const app = express();

// 포트 설정 (.env에 PORT 없으면 기본값 3000)
const PORT = process.env.PORT || 3000;

// 미들웨어 설정
app.use(cors());          // 프론트엔드에서 API 호출 허용
app.use(express.json());  // JSON 요청 파싱

// 서버 상태 확인용 API
app.get('/', (req, res) => {
  res.json({ message: 'TimeBox Server is running! ✅' });
});

// 서버 시작
app.listen(PORT, () => {
  console.log(`서버 시작! 포트: ${PORT}`);
});