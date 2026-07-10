// timeboxRoutes.js
// API URL 경로 정의 (Spring @RequestMapping 역할)

const express = require('express');
const router = express.Router();
const timeboxController = require('../controllers/timeboxController');
const authMiddleware = require('../middlewares/authMiddleware');

// authMiddleware: JWT 토큰 검증 - 로그인한 유저만 접근 가능
router.post('/', authMiddleware, timeboxController.saveTimeBox);
router.get('/', authMiddleware, timeboxController.getTimeBox);

module.exports = router;