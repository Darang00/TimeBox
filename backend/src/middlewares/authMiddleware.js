/** authMiddleware.js 역할
로그인이 필요한 API에서 JWT 토큰 검증하는 역할.
Spring으로 치면 Filter 랑 똑같음. 
 */

/* 동작 방식
 * 프론트에서 API 요청
  → Header에 JWT 토큰 포함
  → Middleware에서 토큰 검증
  → 유효하면 → 다음 로직 진행
  → 무효하면 → 401 에러 반환
 */


const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  // Header에서 토큰 꺼내기
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) { // 토큰 타입을 나타내는 표준 방식
    return res.status(401).json({ message: '토큰이 없습니다.' });
  }

  // "Bearer 토큰값" 에서 토큰값만 추출
  // 공백으로 나눠서 토큰값만 꺼내는 거
  const token = authHeader.split(' ')[1];

  try {
    // 토큰 검증
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 검증 성공 → req에 유저 정보 저장
    req.user = decoded;

    // 다음 미들웨어 또는 컨트롤러로 이동
    // 미들웨어에서 다음 단계로 넘어가라는 신호
    next(); // 요청 → authMiddleware → next() → Controller
  } catch (error) {
    return res.status(401).json({ message: '유효하지 않은 토큰입니다.' });
  }
};

module.exports = authMiddleware;