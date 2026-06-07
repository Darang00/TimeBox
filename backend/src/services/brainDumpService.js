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

// Brain Dump 체크 상태 변경 (Big 3 선택/해제)
const updateDumpCheck = async (userId, dumpId, isChecked) => {
    // 체크 시 현재 체크된 항목 수와 max_priority 비교
    if (isChecked) {
      const countResult = await pool.query(
        `SELECT COUNT(bd.dump_id) as checked_count, ds.max_priority
         FROM brain_dump bd
         JOIN daily_schedule ds ON bd.schedule_id = ds.schedule_id
         WHERE ds.user_id = $1 AND bd.is_checked = true
         GROUP BY ds.max_priority`,
        [userId]
      );
  
      // 체크된 항목이 있고 max_priority 이상이면 차단
      if (countResult.rows.length > 0) {
        const { checked_count, max_priority } = countResult.rows[0];
        if (parseInt(checked_count) >= max_priority) {
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

// Brain Dump 항목 삭제
const deleteDump = async (dumpId) => {
  await pool.query('DELETE FROM brain_dump WHERE dump_id = $1', [dumpId]);
  return { success: true };
};

module.exports = { addDump, getDumps, updateDumpCheck, deleteDump };