// timeboxService.js
// Time Box Business Logic (Spring @Service 역할)

const pool = require('../db');

/* 날짜에 해당하는 schedule_id 반환, 없으면 새로 생성 */
const getOrCreateSchedule = async (userId, date) => {
  const existing = await pool.query(
    'SELECT schedule_id FROM daily_schedule WHERE user_id = $1 AND schedule_date = $2',
    [userId, date]
  );

  if (existing.rows.length > 0) {
    return existing.rows[0].schedule_id;
  }

  const created = await pool.query(
    'INSERT INTO daily_schedule (user_id, schedule_date) VALUES ($1, $2) RETURNING schedule_id',
    [userId, date]
  );

  return created.rows[0].schedule_id;
};

/* Time Box 저장 (Upsert 패턴 - Early Return으로 else 제거) */
const saveTimeBox = async (userId, date, hour, firstHalf, secondHalf) => {
  const scheduleId = await getOrCreateSchedule(userId, date);

  const existing = await pool.query(
    'SELECT timebox_id FROM time_box WHERE schedule_id = $1 AND hour = $2',
    [scheduleId, hour]
  );

  if (existing.rows.length > 0) {
    await pool.query(
      'UPDATE time_box SET first_half = $1, second_half = $2, updated_at = NOW() WHERE schedule_id = $3 AND hour = $4',
      [firstHalf, secondHalf, scheduleId, hour]
    );
    return { success: true };
  }

  await pool.query(
    'INSERT INTO time_box (schedule_id, hour, first_half, second_half) VALUES ($1, $2, $3, $4)',
    [scheduleId, hour, firstHalf, secondHalf]
  );

  return { success: true };
};

/* 날짜별 Time Box 전체 조회, 해당 날짜 스케줄 없으면 빈 배열 반환 */
const getTimeBoxByDate = async (userId, date) => {
  const scheduleResult = await pool.query(
    'SELECT schedule_id FROM daily_schedule WHERE user_id = $1 AND schedule_date = $2',
    [userId, date]
  );

  if (scheduleResult.rows.length === 0) {
    return [];
  }

  const scheduleId = scheduleResult.rows[0].schedule_id;

  const result = await pool.query(
    'SELECT hour, first_half, second_half FROM time_box WHERE schedule_id = $1 ORDER BY hour',
    [scheduleId]
  );

  return result.rows;
};

module.exports = { saveTimeBox, getTimeBoxByDate };