// calendarService.js
// Calendar 관련 DB 처리 (Spring @Service 역할)

const pool = require('../db');

// 월간 달성률 통계 (날짜별 완료수/전체수)
const getMonthlyStats = async (userId, year, month) => {
    const result = await pool.query(
      `SELECT 
         TO_CHAR(ds.schedule_date, 'YYYY-MM-DD') AS schedule_date,
         COUNT(*) FILTER (WHERE pt.is_priority = true) AS total,
         COUNT(*) FILTER (WHERE pt.is_priority = true AND pt.is_completed = true) AS completed
       FROM daily_schedule ds
       JOIN priority_task pt ON pt.schedule_id = ds.schedule_id
       WHERE ds.user_id = $1
         AND EXTRACT(YEAR FROM ds.schedule_date) = $2
         AND EXTRACT(MONTH FROM ds.schedule_date) = $3
       GROUP BY ds.schedule_date`,
      [userId, year, month]
    );
  
    const stats = {};
    result.rows.forEach((row) => {
      // 이미 'YYYY-MM-DD' 문자열이라 Date 변환/타임존 계산이 아예 안 일어남
      stats[row.schedule_date] = {
        total: Number(row.total),
        completed: Number(row.completed),
      };
    });
  
    return stats;
  };

module.exports = { getMonthlyStats };