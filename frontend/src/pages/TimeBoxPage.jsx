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
import './TimeBoxPage.css';
import MonthlyHeatmap from '../components/MonthlyHeatmap';

function TimeBoxPage({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState('daily'); // 'daily' | 'calendar' 탭
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


  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <div className="page">
        {/* 헤더 */}
        <div className="header">
          <h1 className="headerTitle">⏱ Time Box</h1>
          <div className="headerRight">
            <span className="nickname">{user.nickname}님</span>
            <button className="logoutBtn" onClick={onLogout}>로그아웃</button>
          </div>
        </div>

        <div className="content">
          <div className="tabBar">
            <button
              className={`tabBtn ${activeTab === 'daily' ? 'active' : ''}`}
              onClick={() => setActiveTab('daily')}
            >
              Daily
            </button>
            <button
              className={`tabBtn ${activeTab === 'calendar' ? 'active' : ''}`}
              onClick={() => setActiveTab('calendar')}
            >
              Calendar
            </button>
          </div>

          {activeTab === 'daily' && (
            <>
              {/* 기존 dateBar, activeDump 표시, grid 전부 그대로 이 안에 */}
              {/* 날짜 선택 */}
              <div className="dateBar">
                <button
                  onClick={() => {
                    const prev = new Date(selectedDate);
                    prev.setDate(prev.getDate() - 1);
                    setSelectedDate(prev.toISOString().split('T')[0]);
                  }}
                  className="navBtn"
                >
                  ‹
                </button>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="dateInput"
                />
                <button
                  onClick={() => {
                    const next = new Date(selectedDate);
                    next.setDate(next.getDate() + 1);
                    setSelectedDate(next.toISOString().split('T')[0]);
                  }}
                  className="navBtn"
                >
                  ›
                </button>
              </div>

              {/* activeDump 표시 */}
              {activeDump && (
                <div className="activeDumpBar">
                  <span>선택됨: <strong>{activeDump.content}</strong> — 칸을 클릭하거나 Shift를 누른 상태에서 여러 칸에 적용</span>
                  <button className="cancelBtn" onClick={() => setActiveDump(null)}>취소</button>
                </div>
              )}

              {/* 메인 그리드 */}
          <div className="grid">
            {/* 왼쪽: Time Box */}
            

            <div className="leftPanel">
              <TimeBoxGrid
                ref={timeBoxGridRef}
                selectedDate={selectedDate}
                dumps={dumps}
                activeDump={activeDump}
              />
            </div>

            {/* 오른쪽: Brain Dump + Priority Task */}
            <div className="rightPanel">
              <div className="card">
                <BrainDump
                  selectedDate={selectedDate}
                  onCheckedChange={handleCheckedChange}
                  dumps={dumps}
                  setDumps={setDumps}
                  activeDump={activeDump}
                  setActiveDump={setActiveDump}
                />
              </div>
              <div className="card">
                <PriorityTask
                  selectedDate={selectedDate}
                  refreshTrigger={refreshTrigger}
                />
              </div>
            </div>
          </div>

            </>
          )}
          {activeTab === 'calendar' && (
            <MonthlyHeatmap
              onDateClick={(date) => {
                setSelectedDate(date);
                setActiveTab('daily');
              }}
            />
          )}
        </div>
      </div>
    </DndContext>
  );
}

export default TimeBoxPage;