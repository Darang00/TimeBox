// calendarController.js
// Calendar 통계 요청 처리 (Spring @RestController 역할)

const calendarService = require('../services/calendarService');

// 월간 달성률 통계 조회
// GET /api/calendar/monthly-stats?year=2026&month=7
const getMonthlyStats = async (req, res) => {
  const { year, month } = req.query;
  const userId = req.user.userId;

  if (!year || !month) {
    return res.status(400).json({ message: 'year와 month는 필수입니다.' });
  }

  const result = await calendarService.getMonthlyStats(userId, year, month);

  return res.status(200).json(result);
};

module.exports = { getMonthlyStats };