// TimeBoxPage.jsx
// 메인 화면 = 날짜 선택 + Time Box + Brain Dump + Priority Task

// TimeBoxPage.jsx
// 메인 화면 - DndContext로 Brain Dump → Time Box 드래그앤드롭 관리

import { useState, useEffect, useRef } from 'react';
import { DndContext, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import TimeBoxGrid from '../components/TimeBoxGrid';
import BrainDump from '../components/BrainDump';
import PriorityTask from '../components/PriorityTask';
import api from '../services/api';

function TimeBoxPage({ user, onLogout }) {
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [dumps, setDumps] = useState([]);
  const [activeDump, setActiveDump] = useState(null); // 클릭으로 선택된 Brain Dump 항목
  const timeBoxGridRef = useRef(null);

  const sensors = useSensors(useSensor(PointerSensor));

  useEffect(() => {
    setActiveDump(null); // 날짜 바뀌면 activeDump 초기화
    const fetchDumps = async () => {
      const response = await api.get(`/braindump?date=${selectedDate}`);
      setDumps(response.data);
    };

    fetchDumps();
  }, [selectedDate, refreshTrigger]);

  const handleCheckedChange = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  // 드래그앤드롭 완료 시
  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (!over) return;

    const dump = active.data.current?.dump;
    const cellIndex = parseInt(over.id.replace('cell-', ''));

    if (!dump || isNaN(cellIndex)) return;

    if (timeBoxGridRef.current) {
      timeBoxGridRef.current.applyDump(cellIndex, dump.content, null);
    }
  };


  const styles = {
    page: {
      minHeight: '100vh',
      background: 'linear-gradient(160deg, #e0f7fa 0%, #e3f2fd 50%, #f3e5f5 100%)',
    },
    header: {
      background: 'rgba(255,255,255,0.8)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid rgba(0,0,0,0.06)',
      padding: '16px 40px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      position: 'sticky',
      top: 0,
      zIndex: 100,
    },
    headerTitle: {
      fontSize: '22px',
      fontWeight: '800',
      background: 'linear-gradient(135deg, #4facfe, #00f2fe)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      margin: 0,
    },
    headerRight: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
    },
    nickname: {
      fontSize: '14px',
      color: '#555',
      fontWeight: '500',
    },
    logoutBtn: {
      padding: '8px 16px',
      background: 'transparent',
      border: '1px solid #ddd',
      borderRadius: '8px',
      color: '#666',
      fontSize: '13px',
      cursor: 'pointer',
    },
    content: {
      maxWidth: '1400px',
      margin: '0 auto',
      padding: '24px 40px',
    },
    dateBar: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      marginBottom: '24px',
    },
    dateLabel: {
      fontSize: '14px',
      color: '#888',
      fontWeight: '500',
    },
    dateInput: {
      padding: '8px 14px',
      border: '1px solid #ddd',
      borderRadius: '10px',
      fontSize: '14px',
      background: 'white',
      color: '#333',
      outline: 'none',
    },
    activeDumpBar: {
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      padding: '10px 16px',
      background: 'linear-gradient(135deg, #4facfe22, #00f2fe22)',
      border: '1px solid #4facfe55',
      borderRadius: '10px',
      marginBottom: '16px',
      fontSize: '14px',
      color: '#333',
    },
    cancelBtn: {
      padding: '4px 10px',
      background: 'transparent',
      border: '1px solid #aaa',
      borderRadius: '6px',
      fontSize: '12px',
      cursor: 'pointer',
      color: '#666',
    },
    grid: {
      display: 'flex',
      gap: '24px',
    },
    leftPanel: {
      flex: '0 0 420px',
      background: 'rgba(255,255,255,0.7)',
      backdropFilter: 'blur(12px)',
      borderRadius: '20px',
      border: '1px solid rgba(255,255,255,0.8)',
      padding: '24px',
      boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
    },
    rightPanel: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      gap: '20px',
    },
    card: {
      background: 'rgba(255,255,255,0.7)',
      backdropFilter: 'blur(12px)',
      borderRadius: '20px',
      border: '1px solid rgba(255,255,255,0.8)',
      padding: '24px',
      boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
    },
  };

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <div style={styles.page}>
        {/* 헤더 */}
        <div style={styles.header}>
          <h1 style={styles.headerTitle}>⏱ Time Box</h1>
          <div style={styles.headerRight}>
            <span style={styles.nickname}>{user.nickname}님</span>
            <button style={styles.logoutBtn} onClick={onLogout}>로그아웃</button>
          </div>
        </div>

        <div style={styles.content}>
          {/* 날짜 선택 */}
          <div style={styles.dateBar}>
            <button
              onClick={() => {
                const prev = new Date(selectedDate);
                prev.setDate(prev.getDate() - 1);
                setSelectedDate(prev.toISOString().split('T')[0]);
              }}
              style={{ ...styles.logoutBtn, padding: '6px 12px', fontSize: '16px' }}
            >
              ‹
            </button>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              style={styles.dateInput}
            />
            <button
              onClick={() => {
                const next = new Date(selectedDate);
                next.setDate(next.getDate() + 1);
                setSelectedDate(next.toISOString().split('T')[0]);
              }}
              style={{ ...styles.logoutBtn, padding: '6px 12px', fontSize: '16px' }}
            >
              ›
            </button>
          </div>

          {/* activeDump 표시 */}
          {activeDump && (
            <div style={styles.activeDumpBar}>
              <span>선택됨: <strong>{activeDump.content}</strong> — 칸을 클릭하거나 Shift 클릭으로 여러 칸에 적용</span>
              <button style={styles.cancelBtn} onClick={() => setActiveDump(null)}>취소</button>
            </div>
          )}

          {/* 메인 그리드 */}
          <div style={styles.grid}>
            {/* 왼쪽: Time Box */}
            <div style={styles.leftPanel}>
              <TimeBoxGrid
                ref={timeBoxGridRef}
                selectedDate={selectedDate}
                dumps={dumps}
                activeDump={activeDump}
              />
            </div>

            {/* 오른쪽: Brain Dump + Priority Task */}
            <div style={styles.rightPanel}>
              <div style={styles.card}>
                <BrainDump
                  selectedDate={selectedDate}
                  onCheckedChange={handleCheckedChange}
                  dumps={dumps}
                  setDumps={setDumps}
                  activeDump={activeDump}
                  setActiveDump={setActiveDump}
                />
              </div>
              <div style={styles.card}>
                <PriorityTask
                  selectedDate={selectedDate}
                  refreshTrigger={refreshTrigger}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </DndContext>
  );
}

export default TimeBoxPage;