// brainDumpService.js
// Brain Dump 비즈니스 로직 (Spring @Service 역할)

const pool = require('../db');

// 날짜에 해당하는 schedule_id 가져오기 (없으면 생성)
const getOrCreateSchedule = async (userId, date) => {
  const existing = await pool.query(
    'SELECT schedule_id FROM daily_schedule WHERE user_id = $1 AND schedule_date = $2',
    [userId, date]
  );

  if (existing.rows.length > 0) {
    return existing.rows[0].schedule_id;
  }

  const created = await pool.query(
    `INSERT INTO daily_schedule (user_id, schedule_date)
     VALUES ($1, $2)
     ON CONFLICT (user_id, schedule_date) DO NOTHING
     RETURNING schedule_id`,
    [userId, date]
  );

  if (created.rows.length > 0) {
    return created.rows[0].schedule_id;
  }

  const retry = await pool.query(
    'SELECT schedule_id FROM daily_schedule WHERE user_id = $1 AND schedule_date = $2',
    [userId, date]
  );

  return retry.rows[0].schedule_id;
};

// Brain Dump 항목 추가
const addDump = async (userId, date, content) => {
  const scheduleId = await getOrCreateSchedule(userId, date);

  const result = await pool.query(
    `INSERT INTO brain_dump (schedule_id, content, is_checked)
     VALUES ($1, $2, false)
     RETURNING dump_id, content, is_checked, created_at`,
    [scheduleId, content]
  );

  return result.rows[0];
};

// 날짜별 Brain Dump 전체 조회
const getDumps = async (userId, date) => {
  const scheduleResult = await pool.query(
    'SELECT schedule_id FROM daily_schedule WHERE user_id = $1 AND schedule_date = $2',
    [userId, date]
  );

  if (scheduleResult.rows.length === 0) {
    return [];
  }

  const scheduleId = scheduleResult.rows[0].schedule_id;

  const result = await pool.query(
    'SELECT dump_id, content, is_checked, created_at FROM brain_dump WHERE schedule_id = $1 ORDER BY created_at',
    [scheduleId]
  );

  return result.rows;
};

// Brain Dump 체크 상태 변경 (Priority Task 선택/해제)
const updateDumpCheck = async (userId, dumpId, isChecked) => {
    // 체크 시 현재 체크된 항목 수와 max_priority 비교
    if (isChecked) {
      // dumpId로 해당 날짜의 schedule_id 조회
      const scheduleResult = await pool.query(
        `SELECT ds.schedule_id, ds.max_priority
         FROM brain_dump bd
         JOIN daily_schedule ds ON bd.schedule_id = ds.schedule_id
         WHERE bd.dump_id = $1`,
        [dumpId]
      );
      
      if (scheduleResult.rows.length > 0) {
        const { schedule_id, max_priority } = scheduleResult.rows[0];
      
        // 해당 날짜에 체크된 항목 수 조회
        const countResult = await pool.query(
          'SELECT COUNT(*) as checked_count FROM brain_dump WHERE schedule_id = $1 AND is_checked = true',
          [schedule_id]
        );
        
        const checkedCount = parseInt(countResult.rows[0].checked_count);
        
        if (checkedCount >= max_priority) {
          return { error: `최대 ${max_priority}개까지만 선택할 수 있습니다.` };
        }
      }
    }

    const result = await pool.query(
      'UPDATE brain_dump SET is_checked = $1 WHERE dump_id = $2 RETURNING dump_id, content, is_checked',
      [isChecked, dumpId]
    );

    return result.rows[0];
  };

/* Brain Dump 항목 삭제
const deleteDump = async (dumpId) => {
  await pool.query('DELETE FROM brain_dump WHERE dump_id = $1', [dumpId]);
  return { success: true };
}; */

/* Brain Dump 항목 삭제 (체크된 경우 priority_task도 함께 삭제)
const deleteDump = async (dumpId) => {
    // priority_task 먼저 삭제 (FK 제약 때문에 brain_dump보다 먼저)
    await pool.query('DELETE FROM priority_task WHERE dump_id = $1', [dumpId]);
    await pool.query('DELETE FROM brain_dump WHERE dump_id = $1', [dumpId]);
    return { success: true };
  }; */

 // Brain Dump 항목 삭제 (체크된 경우 priority_task도 함께 삭제)
  const deleteDump = async (dumpId) => {
    // priority_task에서 schedule_id 먼저 조회
    const taskResult = await pool.query(
      'SELECT schedule_id FROM priority_task WHERE dump_id = $1',
      [dumpId]
    );
  
    const scheduleId = taskResult.rows.length > 0 ? taskResult.rows[0].schedule_id : null;
  
    // priority_task 먼저 삭제 (FK 제약)
    await pool.query('DELETE FROM priority_task WHERE dump_id = $1', [dumpId]);
    await pool.query('DELETE FROM brain_dump WHERE dump_id = $1', [dumpId]);
  
    // priority_task 남은 항목 재채번
    if (scheduleId) {
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
    }
  
    return { success: true };
  };

module.exports = { addDump, getDumps, updateDumpCheck, deleteDump };