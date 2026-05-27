// TimeBoxGrid.jsx
// 24시간 x 30분 단위 Time Box 그리드 컴포넌트

import { useState, useEffect } from 'react';
import api from '../services/api';
import useDebounce from '../hooks/useDebounce';

function TimeBoxGrid({ selectedDate }) {
  // 24시간 데이터를 배열로 관리
  // 각 hour마다 first_half(:00~:30), second_half(:30~:00) 가짐
  const [boxes, setBoxes] = useState(
    Array.from({ length: 24 }, (_, i) => ({ // 0~23시 배열을 초기값으로 만드는 거
      hour: i,
      first_half: '',
      second_half: '',
    }))
  );
  const [saveStatus, setSaveStatus] = useState(''); // '저장 중...', '저장됨'

  // 날짜가 바뀌면 해당 날짜 데이터 불러오기
  useEffect(() => {
    const fetchData = async () => {
      const response = await api.get(`/timebox?date=${selectedDate}`);
      const data = response.data;

      // 불러온 데이터를 boxes 배열에 반영
      setBoxes((prev) => // prev: setBoxes 호출 시점의 현재 boxes 상태값
        prev.map((box) => {
          const found = data.find((d) => d.hour === box.hour);
          if (found) {
            return { ...box, first_half: found.first_half, second_half: found.second_half };
          }
          return { ...box, first_half: '', second_half: '' };
        })
      );
    };

    fetchData();
  }, [selectedDate]); // selectedDate 바뀔 때마다 실행

  // 입력값 변경 핸들러
  const handleChange = (hour, field, value) => {
    setBoxes((prev) =>
      prev.map((box) => {
        if (box.hour !== hour) return box;
        return { ...box, [field]: value };
      })
    );
  };

  // Debounce 적용 - boxes가 바뀌고 1초 후에 자동저장
  const debouncedBoxes = useDebounce(boxes, 1000);

  useEffect(() => {
    const saveAll = async () => {

      // 내용이 있는 box만 필터링, 빈 값이면 저장 안 함
      const filledBoxes = debouncedBoxes.filter(
        (box) => box.first_half.trim() !== '' || box.second_half.trim() !== ''
      );
  
      if (filledBoxes.length === 0) return;

      setSaveStatus('저장 중...');

      await Promise.all(
        filledBoxes.map((box) =>
          api.post('/timebox', {
            date: selectedDate,
            hour: box.hour,
            first_half: box.first_half,
            second_half: box.second_half,
          })
        )
      );

      setSaveStatus('저장됨 ✓');
    };

    saveAll();
  }, [debouncedBoxes]); // debouncedBoxes 바뀔 때마다 실행

  return (
    <div>
      <p style={{ textAlign: 'right', color: 'gray' }}>{saveStatus}</p>
      {boxes.map((box) => (
        <div key={box.hour} style={{ display: 'flex', alignItems: 'center', marginBottom: '8px', gap: '10px' }}>
          <span style={{ width: '50px' }}>{String(box.hour).padStart(2, '0')}:00</span>
          <input
            type="text"
            value={box.first_half}
            onChange={(e) => handleChange(box.hour, 'first_half', e.target.value)}
            placeholder=":00 ~ :30"
            style={{ flex: 1 }}
          />
          <input
            type="text"
            value={box.second_half}
            onChange={(e) => handleChange(box.hour, 'second_half', e.target.value)}
            placeholder=":30 ~ :00"
            style={{ flex: 1 }}
          />
        </div>
      ))}
    </div>
  );
}

export default TimeBoxGrid;