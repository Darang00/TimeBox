/* authRoutes.js 역할
URL 경로랑 Controller 연결해주는 역할.
Spring으로 치면 @RequestMapping 이랑 똑같음
*/

/* Method of Router (same as HTTP methosd)
router.get()    : search
router.post()   : create
router.put()    : update
router.delete() : delete
*/


const express = require('express'); // Express에서 라우터를 분리해서 관리하는 방법
const router = express.Router();
const authController = require('../controllers/authController');

// POST /api/auth/register → 회원가입
router.post('/register', authController.register);

// POST /api/auth/login → 로그인
router.post('/login', authController.login);

module.exports = router;