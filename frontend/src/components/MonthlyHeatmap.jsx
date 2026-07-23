// MonthlyHeatmap.jsx
// 캘린더 히트맵 - 날짜별 Priority Task 달성률을 색 진하기로 표현

import { useState, useEffect } from 'react';
import './MonthlyHeatmap.css';
import api from '../services/api';

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

// 달성률(rate)에 따라 클래스명 결정
function getRateClass(stat) {
  if (!stat || stat.total === 0) return 'rate-none';

  const rate = stat.completed / stat.total;
  if (rate === 0) return 'rate-0';
  if (rate < 0.34) return 'rate-low';
  if (rate < 0.67) return 'rate-mid';
  if (rate < 1) return 'rate-high';
  return 'rate-full';
}

// YYYY-MM-DD 형식으로 변환
function toDateStr(year, month, day) {
  const mm = String(month).padStart(2, '0');
  const dd = String(day).padStart(2, '0');
  return `${year}-${mm}-${dd}`;
}

function MonthlyHeatmap({ onDateClick }) {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth() + 1); // 1~12
  const [stats, setStats] = useState({});

  useEffect(() => {
    const fetchStats = async () => {
      const response = await api.get(`/calendar/monthly-stats?year=${year}&month=${month}`);
      setStats(response.data);
    };

    fetchStats();
  }, [year, month]);

  const handlePrevMonth = () => {
    if (month === 1) {
      setYear((y) => y - 1);
      setMonth(12);
    } else {
      setMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (month === 12) {
      setYear((y) => y + 1);
      setMonth(1);
    } else {
      setMonth((m) => m + 1);
    }
  };

  // 이번 달 1일의 요일 (0=일요일)
  const firstDayOfWeek = new Date(year, month - 1, 1).getDay();
  // 이번 달의 총 일수
  const daysInMonth = new Date(year, month, 0).getDate();

  // 42칸(6주 x 7일) 채우기: 앞은 빈칸, 뒤는 날짜
  const cells = [];
  for (let i = 0; i < firstDayOfWeek; i++) {
    cells.push(null);
  }
  for (let day = 1; day <= daysInMonth; day++) {
    cells.push(day);
  }
  while (cells.length < 42) {
    cells.push(null);
  }

  const isToday = (day) =>
    day === today.getDate() &&
    month === today.getMonth() + 1 &&
    year === today.getFullYear();

  return (
    <div className="heatmapContainer">
      <div className="heatmapNav">
        <button className="heatmapNavBtn" onClick={handlePrevMonth}>‹</button>
        <span className="heatmapMonthLabel">{year}년 {month}월</span>
        <button className="heatmapNavBtn" onClick={handleNextMonth}>›</button>
      </div>

      <div className="heatmapWeekdays">
        {WEEKDAYS.map((w) => (
          <span key={w} className="heatmapWeekday">{w}</span>
        ))}
      </div>

      <div className="heatmapGrid">
        {cells.map((day, i) => {
          if (day === null) {
            return <div key={`empty-${i}`} className="heatmapCell empty" />;
          }

          const dateStr = toDateStr(year, month, day);
          const stat = stats[dateStr];
          const rateClass = getRateClass(stat);

          return (
            <div
              key={dateStr}
              className={`heatmapCell ${rateClass}${isToday(day) ? ' today' : ''}`}
              onClick={() => onDateClick && onDateClick(dateStr)}
              title={stat ? `${stat.completed}/${stat.total} 완료` : '기록 없음'}
            >
              {day}
            </div>
          );
        })}
      </div>

      <div className="heatmapLegend">
        <span>낮음</span>
        <span className="heatmapLegendSwatch" style={{ background: '#deecfc' }} />
        <span className="heatmapLegendSwatch" style={{ background: '#c2e0fe' }} />
        <span className="heatmapLegendSwatch" style={{ background: '#61affe' }} />
        <span className="heatmapLegendSwatch" style={{ background: '#0f84fa' }} />
        <span className="heatmapLegendSwatch" style={{ background: '#016bd5' }} />
        <span>높음</span>
      </div>
    </div>
  );
}

export default MonthlyHeatmap;