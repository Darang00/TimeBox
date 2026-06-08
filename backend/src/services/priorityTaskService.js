// priorityTaskService.js
// Priority Task 비즈니스 로직 (Spring @Service 역할)

const pool = require('../db');

// 날짜별 Priority Task 조회
const getPriorityTasks = async (userId, date) => {
  const scheduleResult = await pool.query(
    'SELECT schedule_id FROM daily_schedule WHERE user_id = $1 AND schedule_date = $2',
    [userId, date]
  );

  if (scheduleResult.rows.length === 0) {
    return [];
  }

  const scheduleId = scheduleResult.rows[0].schedule_id;

  // priority_task와 brain_dump를 JOIN해서 content도 함께 조회
  const result = await pool.query(
    `SELECT pt.schedule_id, pt.dump_id, pt.task_index, pt.is_completed, bd.content
     FROM priority_task pt
     JOIN brain_dump bd ON pt.dump_id = bd.dump_id
     WHERE pt.schedule_id = $1
     ORDER BY pt.task_index`,
    [scheduleId]
  );

  return result.rows;
};

// Brain Dump 체크 시 Priority Task 추가
const addPriorityTask = async (userId, date, dumpId) => {
  const scheduleResult = await pool.query(
    'SELECT schedule_id FROM daily_schedule WHERE user_id = $1 AND schedule_date = $2',
    [userId, date]
  );

  const scheduleId = scheduleResult.rows[0].schedule_id;

  // 현재 task_index 최댓값 + 1로 자동 결정
  const countResult = await pool.query(
    'SELECT COUNT(*) FROM priority_task WHERE schedule_id = $1',
    [scheduleId]
  );

  const taskIndex = parseInt(countResult.rows[0].count) + 1;

  const result = await pool.query(
    `INSERT INTO priority_task (schedule_id, dump_id, task_index, is_completed)
     VALUES ($1, $2, $3, false)
     RETURNING schedule_id, dump_id, task_index, is_completed`,
    [scheduleId, dumpId, taskIndex]
  );

  return result.rows[0];
};

/* Brain Dump 체크 해제 시 Priority Task 삭제
const deletePriorityTaskByDumpId = async (dumpId) => {
  await pool.query('DELETE FROM priority_task WHERE dump_id = $1', [dumpId]);
  return { success: true };
}; */

// Brain Dump 체크 해제 또는 삭제 시 Priority Task 삭제 + index 재채번
const deletePriorityTaskByDumpId = async (dumpId) => {
  // 삭제할 항목의 schedule_id 먼저 조회
  const taskResult = await pool.query(
    'SELECT schedule_id FROM priority_task WHERE dump_id = $1',
    [dumpId]
  );

  if (taskResult.rows.length === 0) {
    return { success: true };
  }

  const scheduleId = taskResult.rows[0].schedule_id;

  // 삭제
  await pool.query('DELETE FROM priority_task WHERE dump_id = $1', [dumpId]);

  // 남은 항목들 task_index 재채번 (1부터 순서대로)
  const remaining = await pool.query(
    'SELECT dump_id FROM priority_task WHERE schedule_id = $1 ORDER BY task_index',
    [scheduleId]
  );

  await Promise.all(
    remaining.rows.map((row, i) =>
      pool.query(
        'UPDATE priority_task SET task_index = $1 WHERE dump_id = $2',
        [i + 1, row.dump_id]
      )
    )
  );

  return { success: true };
};


// 순위 변경 (드래그앤드롭)
const updateTaskIndex = async (scheduleId, dumpId, taskIndex) => {
  const result = await pool.query(
    `UPDATE priority_task SET task_index = $1
     WHERE schedule_id = $2 AND dump_id = $3
     RETURNING schedule_id, dump_id, task_index`,
    [taskIndex, scheduleId, dumpId]
  );

  return result.rows[0];
};

// 완료 여부 변경
const updateCompleted = async (scheduleId, dumpId, isCompleted) => {
  const result = await pool.query(
    `UPDATE priority_task SET is_completed = $1
     WHERE schedule_id = $2 AND dump_id = $3
     RETURNING schedule_id, dump_id, is_completed`,
    [isCompleted, scheduleId, dumpId]
  );

  return result.rows[0];
};

// max_priority 변경 (드롭다운에서 우선순위 개수 변경 시 호출)
const updateMaxPriority = async (userId, date, maxPriority) => {
  const result = await pool.query(
    `UPDATE daily_schedule SET max_priority = $1
     WHERE user_id = $2 AND schedule_date = $3
     RETURNING schedule_id, max_priority`,
    [maxPriority, userId, date]
  );

  return result.rows[0];
};


const getMaxPriority = async (userId, date) => {
  const result = await pool.query(
    'SELECT max_priority FROM daily_schedule WHERE user_id = $1 AND schedule_date = $2',
    [userId, date]
  );

  if (result.rows.length === 0) {
    return { max_priority: 3 };
  }

  return result.rows[0];
};

module.exports = { getPriorityTasks, addPriorityTask, deletePriorityTaskByDumpId, updateTaskIndex, updateCompleted, updateMaxPriority, getMaxPriority };


