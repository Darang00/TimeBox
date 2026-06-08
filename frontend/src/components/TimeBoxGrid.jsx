// TimeBoxGrid.jsx
// 24시간 x 30분 그리드 - Brain Dump 항목을 드래그앤드롭으로 적용

import { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { useDroppable } from '@dnd-kit/core';
import api from '../services/api';
import useDebounce from '../hooks/useDebounce';

const COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4',
  '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F',
  '#BB8FCE', '#85C1E9',
];

function DroppableCell({ cell, content, color, onClick }) {
  const { setNodeRef, isOver } = useDroppable({ id: `cell-${cell.index}` });

  const style = {
    flex: 1,
    height: '28px',
    backgroundColor: isOver ? '#b3d4ff' : (color || '#f0f0f0'),
    border: isOver ? '2px solid #4a9eff' : '1px solid #ddd',
    borderRadius: '3px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    paddingLeft: '6px',
    fontSize: '12px',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    transition: 'background-color 0.1s',
  };

  return (
    <div ref={setNodeRef} style={style} onClick={onClick}>
      {content}
    </div>
  );
}

const TimeBoxGrid = forwardRef(function TimeBoxGrid({ selectedDate, dumps, activeDump }, ref) {
  const [cells, setCells] = useState(
    Array.from({ length: 48 }, (_, i) => ({
      index: i,
      hour: Math.floor(i / 2),
      half: i % 2 === 0 ? 'first_half' : 'second_half',
      content: '',
    }))
  );
  const [lastClickedIndex, setLastClickedIndex] = useState(null);
  const [saveStatus, setSaveStatus] = useState('');
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(false);

    const fetchData = async () => {
      const response = await api.get(`/timebox?date=${selectedDate}`);
      const data = response.data;

      setCells((prev) =>
        prev.map((cell) => {
          const found = data.find((d) => d.hour === cell.hour);
          if (!found) return { ...cell, content: '' };
          return {
            ...cell,
            content: cell.half === 'first_half' ? found.first_half : found.second_half,
          };
        })
      );

      setIsLoaded(true);
    };

    fetchData();
  }, [selectedDate]);

  const getCellColor = (content) => {
    if (!content) return null;
    const dumpIndex = dumps.findIndex((d) => d.content === content);
    return dumpIndex >= 0 ? COLORS[dumpIndex % COLORS.length] : '#ccc';
  };

  const applyDump = (cellIndex, content, e) => {
    if (!content) {
      setCells((prev) =>
        prev.map((cell) => {
          if (cell.index !== cellIndex) return cell;
          return { ...cell, content: '' };
        })
      );
      setLastClickedIndex(null);
      return;
    }

    if (e?.shiftKey && lastClickedIndex !== null) {
      const start = Math.min(lastClickedIndex, cellIndex);
      const end = Math.max(lastClickedIndex, cellIndex);

      setCells((prev) =>
        prev.map((cell) => {
          if (cell.index < start || cell.index > end) return cell;
          return { ...cell, content };
        })
      );
      setLastClickedIndex(cellIndex);
      return;
    }

    setCells((prev) =>
      prev.map((cell) => {
        if (cell.index !== cellIndex) return cell;
        return { ...cell, content };
      })
    );
    setLastClickedIndex(cellIndex);
  };

  useImperativeHandle(ref, () => ({
    applyDump,
  }));

  const handleCellClick = (e, cell) => {
    if (cell.content) {
      applyDump(cell.index, '', null);
      return;
    }

    if (!activeDump) return;

    if (e.shiftKey && lastClickedIndex !== null) {
      const start = Math.min(lastClickedIndex, cell.index);
      const end = Math.max(lastClickedIndex, cell.index);

      setCells((prev) =>
        prev.map((c) => {
          if (c.index < start || c.index > end) return c;
          return { ...c, content: activeDump.content };
        })
      );
      setLastClickedIndex(cell.index);
      return;
    }

    setCells((prev) =>
      prev.map((c) => {
        if (c.index !== cell.index) return c;
        return { ...c, content: activeDump.content };
      })
    );
    setLastClickedIndex(cell.index);
  };

  const debouncedCells = useDebounce(cells, 1000);

  useEffect(() => {
    if (!isLoaded) return;

    const saveAll = async () => {
      const hourMap = {};
      debouncedCells.forEach((cell) => {
        if (!hourMap[cell.hour]) {
          hourMap[cell.hour] = { first_half: '', second_half: '' };
        }
        hourMap[cell.hour][cell.half] = cell.content;
      });

      setSaveStatus('저장 중...');

      await Promise.all(
        Object.entries(hourMap).map(([hour, value]) =>
          api.post('/timebox', {
            date: selectedDate,
            hour: Number(hour),
            first_half: value.first_half,
            second_half: value.second_half,
          })
        )
      );

      setSaveStatus('저장됨 ✓');
    };

    saveAll();
  }, [debouncedCells]);

  return (
    <div>
      <p style={{ textAlign: 'right', color: 'gray', margin: '0 0 10px 0' }}>{saveStatus}</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
        {Array.from({ length: 24 }, (_, hour) => {
          const firstCell = cells[hour * 2];
          const secondCell = cells[hour * 2 + 1];

          return (
            <div key={hour} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ fontSize: '12px', color: 'gray', width: '40px', flexShrink: 0 }}>
                {String(hour).padStart(2, '0')}:00
              </span>
              <DroppableCell
                cell={firstCell}
                content={firstCell.content}
                color={getCellColor(firstCell.content)}
                onClick={(e) => handleCellClick(e, firstCell)}
              />
              <DroppableCell
                cell={secondCell}
                content={secondCell.content}
                color={getCellColor(secondCell.content)}
                onClick={(e) => handleCellClick(e, secondCell)}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
});

export default TimeBoxGrid;