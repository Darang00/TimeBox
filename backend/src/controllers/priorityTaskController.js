// priorityTaskService.js
// Priority Task 요청 처리 (Spring @RestController 역할)

const priorityTaskService = require('../services/priorityTaskService');

// 날짜별 Priority Task 조회
// GET /api/prioritytask?date=2026-06-07
const getPriorityTasks = async (req, res) => {
  const { date } = req.query;
  const userId = req.user.userId;

  if (!date) {
    return res.status(400).json({ message: 'date는 필수입니다.' });
  }

  const result = await priorityTaskService.getPriorityTasks(userId, date);

  return res.status(200).json(result);
};

// Brain Dump 체크 시 Priority Task 추가
// POST /api/prioritytask
const addPriorityTask = async (req, res) => {
  const { date, dumpId } = req.body;
  const userId = req.user.userId;

  if (!date || !dumpId) {
    return res.status(400).json({ message: 'date와 dumpId는 필수입니다.' });
  }

  const result = await priorityTaskService.addPriorityTask(userId, date, dumpId);

  return res.status(201).json(result);
};

// Brain Dump 체크 해제 시 Priority Task 삭제
// DELETE /api/prioritytask/dump/:dumpId
const deletePriorityTaskByDumpId = async (req, res) => {
  const { dumpId } = req.params;

  const result = await priorityTaskService.deletePriorityTaskByDumpId(dumpId);

  return res.status(200).json(result);
};

// 순위 변경 (드래그앤드롭)
// PATCH /api/prioritytask/reorder
const updateTaskIndex = async (req, res) => {
  const { scheduleId, dumpId, taskIndex } = req.body;

  if (!scheduleId || !dumpId || !taskIndex) {
    return res.status(400).json({ message: 'scheduleId, dumpId, taskIndex는 필수입니다.' });
  }

  const result = await priorityTaskService.updateTaskIndex(scheduleId, dumpId, taskIndex);

  return res.status(200).json(result);
};

// 완료 여부 변경
// PATCH /api/prioritytask/complete
const updateCompleted = async (req, res) => {
  const { scheduleId, dumpId, isCompleted } = req.body;

  if (!scheduleId || !dumpId || isCompleted === undefined) {
    return res.status(400).json({ message: 'scheduleId, dumpId, isCompleted는 필수입니다.' });
  }

  const result = await priorityTaskService.updateCompleted(scheduleId, dumpId, isCompleted);

  return res.status(200).json(result);
};

// max_priority 변경
// PATCH /api/prioritytask/max-priority
const updateMaxPriority = async (req, res) => {
  const { date, maxPriority } = req.body;
  const userId = req.user.userId;

  if (!date || !maxPriority) {
    return res.status(400).json({ message: 'date와 maxPriority는 필수입니다.' });
  }

  if (maxPriority < 1) {
    return res.status(400).json({ message: 'maxPriority는 1 이상이어야 합니다.' });
  }

  const result = await priorityTaskService.updateMaxPriority(userId, date, maxPriority);

  return res.status(200).json(result);
};

module.exports = { getPriorityTasks, addPriorityTask, deletePriorityTaskByDumpId, updateTaskIndex, updateCompleted, updateMaxPriority };