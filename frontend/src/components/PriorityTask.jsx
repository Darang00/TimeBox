// PriorityTask.jsx
// Priority Task 컴포넌트 - 체크된 항목 표시 + 드래그앤드롭 순서 변경

import { useState, useEffect } from 'react';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import api from '../services/api';

// 개별 Priority Task 항목 컴포넌트 (드래그 가능)
function SortableItem({ task, onComplete }) {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
      id: task.dump_id,
    });
  
    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      marginBottom: '8px',
    };
  
    return (
      <div ref={setNodeRef} style={style}>
        {/* 드래그 핸들만 listeners 적용 */}
        <span {...attributes} {...listeners} style={{ cursor: 'grab', color: 'gray' }}>⠿</span>
        <span>{task.task_index}.</span>
        <span style={{ flex: 1, textDecoration: task.is_completed ? 'line-through' : 'none' }}>
          {task.content}
        </span>
        <input
          type="checkbox"
          checked={task.is_completed}
          onChange={() => onComplete(task)}
        />
      </div>
    );
  }

function PriorityTask({ selectedDate, refreshTrigger }) {
  const [tasks, setTasks] = useState([]);

  const sensors = useSensors(useSensor(PointerSensor));

  // 날짜 바뀌거나 Brain Dump 체크 바뀌면 다시 불러오기
  useEffect(() => {
    const fetchTasks = async () => {
      const response = await api.get(`/prioritytask?date=${selectedDate}`);
      setTasks(response.data);
    };

    fetchTasks();
  }, [selectedDate, refreshTrigger]);

  // 드래그앤드롭 완료 시 순서 업데이트
  const handleDragEnd = async (event) => {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    const oldIndex = tasks.findIndex((t) => t.dump_id === active.id);
    const newIndex = tasks.findIndex((t) => t.dump_id === over.id);

    // 화면에서 먼저 순서 변경 (즉각 반응)
    const reordered = arrayMove(tasks, oldIndex, newIndex);

    // task_index 재할당
    const updated = reordered.map((task, i) => ({ ...task, task_index: i + 1 }));
    setTasks(updated);

    // DB에 순서 저장
    await Promise.all(
      updated.map((task) =>
        api.patch('/prioritytask/reorder', {
          scheduleId: task.schedule_id,
          dumpId: task.dump_id,
          taskIndex: task.task_index,
        })
      )
    );
  };

  // 완료 여부 변경
  const handleComplete = async (task) => {
    const newCompleted = !task.is_completed;

    setTasks((prev) =>
      prev.map((t) => {
        if (t.dump_id !== task.dump_id) return t;
        return { ...t, is_completed: newCompleted };
      })
    );

    await api.patch('/prioritytask/complete', {
      scheduleId: task.schedule_id,
      dumpId: task.dump_id,
      isCompleted: newCompleted,
    });
  };

  return (
    <div>
      <h2>Priority Task</h2>
      {tasks.length === 0 && (
        <p style={{ color: 'gray' }}>Brain Dump에서 항목을 체크하면 여기에 표시됩니다.</p>
      )}
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={tasks.map((t) => t.dump_id)} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <SortableItem key={task.dump_id} task={task} onComplete={handleComplete} />
          ))}
        </SortableContext>
      </DndContext>
    </div>
  );
}

export default PriorityTask;