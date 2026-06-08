/* 회원가입 → 이메일 중복 체크 → 비밀번호 암호화 → DB 저장
   로그인 → 이메일 조회 → 비밀번호 검증 → JWT 발급 */

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../db');

/* 회원가입 로직
1. 이메일 중복 체크
2. 비밀번호 암호화 (bcrypt)
3. DB에 저장
*/
const register = async (email, password, nickname) => {
  // Check email duplication
  const existingUser = await pool.query(
    'SELECT * FROM users WHERE email = $1',
    [email]
  );
  if (existingUser.rows.length > 0) {
    throw new Error('이미 사용 중인 이메일입니다.');
  }

  // Encrypt Password
  // 10: 암호화 강도
  const hashedPassword = await bcrypt.hash(password, 10);

  // Save in DB
  // $1, $2, $3: PostgreSQL에서 파라미터 바인딩 방식
  // To prevent SQL injection attacks
  const result = await pool.query(
    'INSERT INTO users (email, password, nickname) VALUES ($1, $2, $3) RETURNING user_id, email, nickname',
    [email, hashedPassword, nickname]
  );

  return result.rows[0];
};



/* 로그인 로직
1. 이메일로 유저 조회
2. 비밀번호 검증 (bcrypt)
3. JWT 토큰 발급
*/
const login = async (email, password) => {
  const result = await pool.query(
    'SELECT * FROM users WHERE email = $1',
    [email]
  );

  if (result.rows.length === 0) {
    throw new Error('USER_NOT_FOUND');
  }

  const user = result.rows[0];

  const isValidPassword = await bcrypt.compare(password, user.password);
  if (!isValidPassword) {
    throw new Error('INVALID_PASSWORD');
  }

  const token = jwt.sign(
    { userId: user.user_id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

  return {
    token,
    user: {
      userId: user.user_id,
      email: user.email,
      nickname: user.nickname,
    },
  };
};

module.exports = { register, login };