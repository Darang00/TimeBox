// timeboxController.js
// 프론트 요청 받기 -> Service 호출 -> 응답 반환 (Spring @RestController 역할)

const timeboxService = require('../services/timeboxService');

// Time Box 저장 (자동저장)
// POST /api/timebox
const saveTimeBox = async (req, res) => {
  const { date, hour, first_half, second_half } = req.body;
  const userId = req.user.userId; // authMiddleware에서 JWT 검증 후 넣어준 유저 ID

  // Validation - Backend
  if (!date || hour === undefined) {
    return res.status(400).json({ message: 'date와 hour는 필수입니다.' });
  }

  if (hour < 0 || hour > 23) {
    return res.status(400).json({ message: 'hour는 0~23 사이여야 합니다.' });
  }

  const result = await timeboxService.saveTimeBox(
    userId,
    date,
    hour,
    first_half || '',
    second_half || ''
  );

  return res.status(200).json(result);
};

// 날짜별 Time Box 조회
// GET /api/timebox?date=2026-05-27
const getTimeBox = async (req, res) => {
  const { date } = req.query;
  const userId = req.user.userId;

  // Validation - Backend
  if (!date) {
    return res.status(400).json({ message: 'date는 필수입니다.' });
  }

  const data = await timeboxService.getTimeBoxByDate(userId, date);

  return res.status(200).json(data);
};

module.exports = { saveTimeBox, getTimeBox };