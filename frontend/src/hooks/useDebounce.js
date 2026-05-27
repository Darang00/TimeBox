// useDebounce.js
// 값이 바뀌고 나서 일정 시간이 지난 후에 최신값을 반환하는 훅
// 타이핑할 때마다 저장 요청 보내지 않고, 멈추면 저장하는 자동저장 구현에 사용
// 타이핑할 때마다 value가 바뀌고 → 이전 timer 취소 → 새 timer 시작 → 1초 동안 안 바뀌면 → 저장 실행

import { useState, useEffect } from 'react';

function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    // delay(1초)가 지나면 debouncedValue 업데이트
    const timer = setTimeout(() => {
      setDebouncedValue(value); // delay(1초) 이후 실행될 함수 예약
    }, delay);

    // value가 또 바뀌면 이전 timer 취소하고 다시 시작
    // 타이핑 중엔 계속 취소되다가 멈추면 그때 실행됨
    return () => clearTimeout(timer); // 예약된 함수를 취소. useEffect에서 return으로 반환하면 React가 자동으로 이것을 호출
  }, [value, delay]);

  return debouncedValue;
}

export default useDebounce;