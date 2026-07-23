// calendarRoutes.js
// Calendar API URL 경로 정의 (Spring @RequestMapping 역할)

const express = require('express');
const router = express.Router();
const calendarController = require('../controllers/calendarController');
const authMiddleware = require('../middlewares/authMiddleware'); // 기존 파일명 확인 필요

router.get('/monthly-stats', authMiddleware, calendarController.getMonthlyStats);

module.exports = router;