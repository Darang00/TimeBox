/* authController.js 역할

프론트에서 요청 받기
authService 호출
결과를 프론트에 응답 보내기

Spring으로 치면 @RestController 메서드랑 똑같음 */


/* HTTP Status Code 
200 Success
201 Create Success
400 Bad Request
401 Authentication Failed
500 Server Error
*/

const authService = require('../services/authService');

// 회원가입
const register = async (req, res) => {
 // req.body: data from FrontEnd
  const { email, password, nickname } = req.body;

  // Validation
  if (!email || !password || !nickname) {
    return res.status(400).json({ message: '모든 항목을 입력해주세요.' });
  }

  try {
    const user = await authService.register(email, password, nickname);
    return res.status(201).json({
      message: '회원가입 성공!',
      user,
    });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

// 로그인
const login = async (req, res) => {
  const { email, password } = req.body;

  // Validation - 이메일 형식 체크
  if (!email || !password) {
    return res.status(400).json({ message: '이메일과 비밀번호를 입력해주세요.' });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ code: 'INVALID_EMAIL', message: '이메일 형식을 확인하세요.' });
  }

  try {
    const result = await authService.login(email, password);
    return res.status(200).json({
      message: '로그인 성공!',
      ...result,
    });
  } catch (error) {
    if (error.message === 'USER_NOT_FOUND') {
      return res.status(401).json({ code: 'USER_NOT_FOUND', message: '해당 사용자를 찾을 수 없습니다.' });
    }
    if (error.message === 'INVALID_PASSWORD') {
      return res.status(401).json({ code: 'INVALID_PASSWORD', message: '비밀번호를 확인하세요.' });
    }
    return res.status(401).json({ message: error.message });
  }
};

module.exports = { register, login };