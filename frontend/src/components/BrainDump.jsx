// BrainDump.jsx
// Brain Dump 컴포넌트 - 자유 텍스트 입력 + 체크박스

// BrainDump.jsx
// Brain Dump 컴포넌트 - 자유 텍스트 입력 + 체크박스 + 드래그 가능
import './BrainDump.css';
import { useState, useEffect } from 'react';
import { useDraggable } from '@dnd-kit/core';
import api from '../services/api';

// 드래그 가능한 개별 항목
function DraggableDump({ dump, checkedCount, maxPriority, onCheck, onDelete, activeDump, setActiveDump }) {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
      id: dump.dump_id,
      data: { dump },
    });
  
    const isActive = activeDump?.dump_id === dump.dump_id;
    
    {/*
    const style = {
      transform: transform ? `translate(${transform.x}px, ${transform.y}px)` : undefined,
      opacity: isDragging ? 0.5 : 1,
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      marginBottom: '6px',
      cursor: 'pointer',
      backgroundColor: isActive ? '#e8f4ff' : 'transparent',
      borderRadius: '4px',
      padding: '2px 4px',
    };
   */}
    
    // 동적인 값만 인라인으로 남김
    const dynamicStyle = {
      transform: transform ? `translate(${transform.x}px, ${transform.y}px)` : undefined,
      opacity: isDragging ? 0.5 : 1,
      backgroundColor: isActive ? '#e8f4ff' : 'transparent',
    };
  
    return (
      <div ref={setNodeRef} className="dumpItem" style={dynamicStyle}>
      <input
        className="dumpCheckbox"
        type="checkbox"
        checked={dump.is_checked}
        disabled={!dump.is_checked && checkedCount >= maxPriority}
        onChange={() => onCheck(dump)}
      />
      <span
        className="dumpContent"
        style={{ fontWeight: isActive ? 'bold' : 'normal' }}
        onClick={() => setActiveDump(isActive ? null : dump)}
      >
        {dump.content}
      </span>
      <button className="deleteBtn" onClick={() => onDelete(dump)}>삭제</button>
    </div>
    );
  }

//function BrainDump({ selectedDate, onCheckedChange, dumps, setDumps }) {
function BrainDump({ selectedDate, onCheckedChange, dumps, setDumps, activeDump, setActiveDump }) {
  const [input, setInput] = useState('');
  const [maxPriority, setMaxPriority] = useState(3);

  useEffect(() => {
    const fetchDumps = async () => {
      const response = await api.get(`/braindump?date=${selectedDate}`);
      setDumps(response.data);
    };

    const fetchMaxPriority = async () => {
      const response = await api.get(`/prioritytask/max-priority?date=${selectedDate}`);
      if (response.data?.max_priority) {
        setMaxPriority(response.data.max_priority);
      }
    };

    fetchDumps();
    fetchMaxPriority();
  }, [selectedDate]);

  const checkedCount = dumps.filter((d) => d.is_checked).length;

  const handleAdd = async () => {
    if (input.trim() === '') return;

    const response = await api.post('/braindump', {
      date: selectedDate,
      content: input.trim(),
    });

    setDumps((prev) => [...prev, response.data]);
    setInput('');
  };

  const handleCheck = async (dump) => {
    const newChecked = !dump.is_checked;

    const response = await api.patch(`/braindump/${dump.dump_id}/check`, {
      isChecked: newChecked,
    });

    if (response.data.error) return;

    setDumps((prev) =>
      prev.map((d) => {
        if (d.dump_id !== dump.dump_id) return d;
        return { ...d, is_checked: newChecked };
      })
    );

    if (newChecked) {
      await api.post('/prioritytask', { date: selectedDate, dumpId: dump.dump_id });
    } else {
      await api.delete(`/prioritytask/dump/${dump.dump_id}`);
    }

    onCheckedChange();
  };

  const handleDelete = async (dump) => {
    if (dump.is_checked) {
      await api.delete(`/prioritytask/dump/${dump.dump_id}`);
    }

    await api.delete(`/braindump/${dump.dump_id}`);
    setDumps((prev) => prev.filter((d) => d.dump_id !== dump.dump_id));
    onCheckedChange();
  };

  const handleMaxPriorityChange = async (value) => {
    setMaxPriority(value);
    await api.patch('/prioritytask/max-priority', {
      date: selectedDate,
      maxPriority: value,
    });
  };

  return (
    <div>
      <div className="dumpHeader">
        <h2>Brain Dump</h2>
        <select 
          className="maxPrioritySelect"
          value={maxPriority}
          onChange={(e) => handleMaxPriorityChange(Number(e.target.value))}
        >
          {[1, 2, 3, 4, 5].map((n) => (
            <option key={n} value={n}>{n}개 우선순위</option>
          ))}
        </select>
      </div>

      <div style={{ display: 'flex', gap: '10px', marginBottom: '10px'}}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          placeholder="할 일을 입력하고 Enter"
          style={{ flex: 1 }}
        />
        <button onClick={handleAdd}>추가</button>
      </div>

      {dumps.map((dump) => (
        <DraggableDump
            key={dump.dump_id}
            dump={dump}
            checkedCount={checkedCount}
            maxPriority={maxPriority}
            onCheck={handleCheck}
            onDelete={handleDelete}
            activeDump={activeDump}
            setActiveDump={setActiveDump}
        />
        ))}
    </div>
  );
}

export default BrainDump;