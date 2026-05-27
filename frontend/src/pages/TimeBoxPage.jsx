// TimeBoxPage.jsx
// 메인 화면 - 날짜 선택 + Time Box 그리드

import { useState } from 'react';
import TimeBoxGrid from '../components/TimeBoxGrid';

function TimeBoxPage({ user, onLogout }) {
  // 오늘 날짜를 기본값으로 설정 (YYYY-MM-DD 형식)
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0]
  );

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Time Box</h1>
        <div>
          <span>{user.nickname}님</span>
          <button onClick={onLogout} style={{ marginLeft: '10px' }}>로그아웃</button>
        </div>
      </div>

      <input
        type="date"
        value={selectedDate}
        onChange={(e) => setSelectedDate(e.target.value)}
        style={{ marginBottom: '20px' }}
      />

      <TimeBoxGrid selectedDate={selectedDate} />
    </div>
  );
}

export default TimeBoxPage;