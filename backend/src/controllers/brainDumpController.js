// brainDumpController.js
// Brain Dump 요청 처리 (Spring @RestController 역할)

const brainDumpService = require('../services/brainDumpService');

// Brain Dump 항목 추가
// POST /api/braindump
const addDump = async (req, res) => {
  const { date, content } = req.body;
  const userId = req.user.userId;

  // Backend Validation
  if (!date || !content) {
    return res.status(400).json({ message: 'date와 content는 필수입니다.' });
  }

  if (content.trim() === '') {
    return res.status(400).json({ message: '내용을 입력해주세요.' });
  }

  const result = await brainDumpService.addDump(userId, date, content);

  return res.status(201).json(result);
};

// 날짜별 Brain Dump 전체 조회
// GET /api/braindump?date=2026-05-28
const getDumps = async (req, res) => {
  const { date } = req.query;
  const userId = req.user.userId;

  if (!date) {
    return res.status(400).json({ message: 'date는 필수입니다.' });
  }

  const result = await brainDumpService.getDumps(userId, date);

  return res.status(200).json(result);
};

// 체크 상태 변경
// PATCH /api/braindump/:dumpId/check
const updateDumpCheck = async (req, res) => {
  const { dumpId } = req.params;
  const { isChecked } = req.body;
  const userId = req.user.userId;

  if (isChecked === undefined) {
    return res.status(400).json({ message: 'isChecked는 필수입니다.' });
  }

  const result = await brainDumpService.updateDumpCheck(userId, dumpId, isChecked);

  if (result.error) {
    return res.status(400).json({ message: result.error });
  }

  return res.status(200).json(result);
};

// Brain Dump 항목 삭제
// DELETE /api/braindump/:dumpId
const deleteDump = async (req, res) => {
  const { dumpId } = req.params;

  const result = await brainDumpService.deleteDump(dumpId);

  return res.status(200).json(result);
};

module.exports = { addDump, getDumps, updateDumpCheck, deleteDump };