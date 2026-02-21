import React, { useState, useCallback, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Clock, Edit2, Trash2, Timer } from "lucide-react";
import { loadTasks, saveTasks, checkDailyGoals } from "../utils/storage";

/* -------------------- DATE HELPERS -------------------- */
const getToday = () => new Date().toISOString().split("T")[0];

function addDays(dateStr, n) {
  const d = new Date(dateStr + "T00:00:00");
  d.setDate(d.getDate() + n);
  return d.toISOString().split("T")[0];
}

function formatSectionLabel(dateStr) {
  const today = getToday();
  const tomorrow = addDays(today, 1);
  if (dateStr === today) return "TODAY";
  if (dateStr === tomorrow) return "TOMORROW";
  const d = new Date(dateStr + "T00:00:00");
  return d
    .toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })
    .toUpperCase();
}

/* -------------------- SEED DATA -------------------- */
const T = getToday();
const INITIAL_TASKS = [
  { id: 1, title: "Write project proposal", category: "Work · Documentation", time: "45 min", priority: "high", upNext: true, dueDate: T },
  { id: 3, title: "Prepare sprint retrospective", category: "Team · Meeting prep", time: "30 min", priority: "medium", dueDate: T },
  { id: 4, title: "Reply to client emails", category: "Communication", time: "15 min", priority: "low", dueDate: T },
  { id: 5, title: "Design landing page mockup", category: "Design · Creative", time: "60 min", priority: "high", dueDate: addDays(T, 1) },
  { id: 6, title: "Write unit tests for auth module", category: "Development · Testing", time: "40 min", priority: "medium", dueDate: addDays(T, 1) },
  { id: 7, title: "Update dependency packages", category: "Maintenance", time: "20 min", priority: "low", dueDate: addDays(T, 3) },
];
const INITIAL_COMPLETED = [
  { id: 2, title: "Review pull requests", category: "Development", time: "25 min", priority: "medium", done: true, dueDate: T },
];

/* purge completed tasks older than 24 hours */
function purgeExpiredCompleted(completedArr) {
  const cutoff = Date.now() - 24 * 60 * 60 * 1000;
  return completedArr.filter((t) => !t.completedAt || t.completedAt > cutoff);
}

function getInitialState() {
  const saved = loadTasks();
  return {
    tasks: saved.tasks || [],
    completed: purgeExpiredCompleted(saved.completed || [])
  };
}

/* -------------------- SORT HELPERS -------------------- */
const PRIORITY_ORDER = { high: 0, medium: 1, low: 2 };
const byPriority = (a, b) => (PRIORITY_ORDER[a.priority] ?? 3) - (PRIORITY_ORDER[b.priority] ?? 3);

/* -------------------- ROW -------------------- */
const TaskRow = ({ task, onToggle, onDelete, onEdit, onTimer, onDragStart }) => (
  <div
    className={`task-row${task.upNext ? " task-row--active" : ""}${task.done ? " task-row--done" : ""}`}
    draggable
    onDragStart={(e) => onDragStart(e, task.id)}
  >
    <div className="task-left">
      <span
        className={`task-checkbox priority-${task.priority}${task.done ? " task-checkbox--done" : ""}`}
        onClick={() => onToggle(task.id)}
        style={{ cursor: "pointer" }}
      />
      <div>
        <div className="task-title">
          {task.done ? <s>{task.title}</s> : task.title}
          {task.upNext && (
            <span className="up-next">
              <span className="up-next-icon">✦</span> Up next
            </span>
          )}
        </div>
        <div className="task-sub">{task.category}</div>
      </div>
    </div>

    <div className="task-right">
      <div
        className={`task-meta${!task.done ? " task-meta--clickable" : ""}`}
        title={!task.done ? "Start Focus Timer" : undefined}
        onClick={!task.done ? () => onTimer(task.id) : undefined}
      >
        <Clock size={14} />
        <span>{task.time}</span>
      </div>

      <div className="task-actions">
        {!task.done && (
          <button className="task-icon-btn" title="Start Focus Timer" onClick={() => onTimer(task.id)}>
            <Timer size={16} />
          </button>
        )}
        <button className="task-icon-btn" title="Edit" onClick={() => onEdit(task.id)}>
          <Edit2 size={16} />
        </button>
        <button className="task-icon-btn task-icon-btn--danger" title="Delete" onClick={() => onDelete(task.id)}>
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  </div>
);

/* -------------------- PAGE -------------------- */
const Tasks = () => {
  const navigate = useNavigate();
  const init = getInitialState();

  const [tasks, setTasks] = useState(init.tasks);
  const [completed, setCompleted] = useState(init.completed);
  const [draggedTaskId, setDraggedTaskId] = useState(null);
  const [dragOverDate, setDragOverDate] = useState(null);

  const persist = useCallback((t, c) => {
    saveTasks({ tasks: t, completed: c });
    checkDailyGoals();
  }, []);

  /* ---- TOGGLE ---- */
  const handleToggle = useCallback((id) => {
    const task = tasks.find((t) => t.id === id);
    if (task) {
      const nextTasks = tasks.filter((t) => t.id !== id);
      const nextCompleted = [...completed, { ...task, done: true, upNext: false, completedAt: Date.now() }];
      setTasks(nextTasks);
      setCompleted(nextCompleted);
      persist(nextTasks, nextCompleted);
      return;
    }
    const doneTask = completed.find((t) => t.id === id);
    if (doneTask) {
      const nextCompleted = completed.filter((t) => t.id !== id);
      const nextTasks = [...tasks, { ...doneTask, done: false }]
        .sort((a, b) => a.dueDate.localeCompare(b.dueDate) || byPriority(a, b));
      setCompleted(nextCompleted);
      setTasks(nextTasks);
      persist(nextTasks, nextCompleted);
    }
  }, [tasks, completed, persist]);

  /* ---- DELETE + UNDO ---- */
  const undoRef = useRef(null);
  const [undoToast, setUndoToast] = useState(null);

  const handleDelete = useCallback((id) => {
    const inTasks = tasks.find((t) => t.id === id);
    const inCompleted = completed.find((t) => t.id === id);
    const source = inTasks ? "tasks" : inCompleted ? "completed" : null;
    if (!source) return;

    const deletedTask = inTasks || inCompleted;
    const nextTasks = tasks.filter((t) => t.id !== id);
    const nextCompleted = completed.filter((t) => t.id !== id);
    setTasks(nextTasks);
    setCompleted(nextCompleted);
    persist(nextTasks, nextCompleted);

    if (undoRef.current) clearTimeout(undoRef.current);
    setUndoToast({ task: deletedTask, source, snapshot: { tasks: nextTasks, completed: nextCompleted } });
    undoRef.current = setTimeout(() => setUndoToast(null), 15000);
  }, [tasks, completed, persist]);

  const handleUndoDelete = useCallback(() => {
    if (!undoToast) return;
    if (undoRef.current) clearTimeout(undoRef.current);

    const { task, source, snapshot } = undoToast;
    let nextTasks = snapshot.tasks;
    let nextCompleted = snapshot.completed;

    if (source === "tasks") {
      nextTasks = [...snapshot.tasks, task]
        .sort((a, b) => a.dueDate.localeCompare(b.dueDate) || byPriority(a, b));
    } else {
      nextCompleted = [...snapshot.completed, task];
    }

    setTasks(nextTasks);
    setCompleted(nextCompleted);
    persist(nextTasks, nextCompleted);
    setUndoToast(null);
  }, [undoToast, persist]);

  /* ---- TIMER ---- */
  const handleTimer = useCallback(() => navigate("/focus"), [navigate]);

  /* ---- DRAG AND DROP ---- */
  const handleDragStart = (e, id) => {
    setDraggedTaskId(id);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e, date) => {
    e.preventDefault();
    setDragOverDate(date);
  };

  const handleDrop = (e, date) => {
    e.preventDefault();
    setDragOverDate(null);
    if (!draggedTaskId) return;

    const taskToMove = tasks.find(t => t.id === draggedTaskId);
    if (!taskToMove || taskToMove.dueDate === date) {
      setDraggedTaskId(null);
      return;
    }

    const nextTasks = tasks.map(t =>
      t.id === draggedTaskId ? { ...t, dueDate: date } : t
    ).sort((a, b) => a.dueDate.localeCompare(b.dueDate) || byPriority(a, b));

    setTasks(nextTasks);
    persist(nextTasks, completed);
    setDraggedTaskId(null);

    toast.success(`Task rescheduled to ${formatSectionLabel(date)}`);
  };

  /* ---- ADD MODAL ---- */
  const EMPTY_FORM = { title: "", category: "", time: 25, priority: "medium", dueDate: getToday() };
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const titleRef = useRef(null);

  const openModal = () => { setForm({ ...EMPTY_FORM, dueDate: getToday() }); setIsModalOpen(true); };
  const closeModal = () => setIsModalOpen(false);

  const handleAddTask = useCallback(() => {
    if (!form.title.trim()) return;
    const newTask = {
      id: Date.now(),
      title: form.title.trim(),
      category: form.category.trim() || "General",
      time: `${form.time} min`,
      priority: form.priority,
      dueDate: form.dueDate || getToday(),
    };
    const nextTasks = [...tasks, newTask]
      .sort((a, b) => a.dueDate.localeCompare(b.dueDate) || byPriority(a, b));
    setTasks(nextTasks);
    persist(nextTasks, completed);
    closeModal();
  }, [form, tasks, completed, persist]);

  useEffect(() => {
    if (!isModalOpen) return;
    setTimeout(() => titleRef.current?.focus(), 50);
  }, [isModalOpen]);

  useEffect(() => {
    if (!isModalOpen) return;
    const onKey = (e) => {
      if (e.key === "Escape") closeModal();
      if (e.key === "Enter" && form.title.trim()) handleAddTask();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isModalOpen, form.title, handleAddTask]);

  /* ---- EDIT MODAL ---- */
  const [editState, setEditState] = useState(null);
  const [editForm, setEditForm] = useState({});
  const editTitleRef = useRef(null);

  const handleEdit = useCallback((id) => {
    const task =
      tasks.find((t) => t.id === id) ||
      completed.find((t) => t.id === id);
    if (!task) return;
    const source = tasks.find((t) => t.id === id) ? "tasks" : "completed";
    setEditForm({
      title: task.title,
      category: task.category,
      time: parseInt(task.time) || 25,
      priority: task.priority,
      dueDate: task.dueDate || getToday(),
    });
    setEditState({ task, source });
  }, [tasks, completed]);

  const closeEditModal = () => setEditState(null);

  const handleSaveEdit = useCallback(() => {
    if (!editForm.title.trim() || !editState) return;
    const updatedTask = {
      ...editState.task,
      title: editForm.title.trim(),
      category: editForm.category.trim() || "General",
      time: `${editForm.time} min`,
      priority: editForm.priority,
      dueDate: editForm.dueDate || getToday(),
    };

    let nextTasks = tasks.filter((t) => t.id !== updatedTask.id);
    let nextCompleted = completed.filter((t) => t.id !== updatedTask.id);

    if (editState.source === "completed") {
      nextCompleted = [...nextCompleted, { ...updatedTask, done: true }];
    } else {
      nextTasks = [...nextTasks, { ...updatedTask, done: false }]
        .sort((a, b) => a.dueDate.localeCompare(b.dueDate) || byPriority(a, b));
    }

    setTasks(nextTasks);
    setCompleted(nextCompleted);
    persist(nextTasks, nextCompleted);
    closeEditModal();
  }, [editForm, editState, tasks, completed, persist]);

  useEffect(() => {
    if (!editState) return;
    setTimeout(() => editTitleRef.current?.focus(), 50);
  }, [editState]);

  useEffect(() => {
    if (!editState) return;
    const onKey = (e) => {
      if (e.key === "Escape") closeEditModal();
      if (e.key === "Enter" && editForm.title.trim()) handleSaveEdit();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [editState, editForm.title, handleSaveEdit]);

  /* ---- DERIVED GROUPS ---- */
  const grouped = tasks.reduce((acc, task) => {
    const key = task.dueDate || getToday();
    if (!acc[key]) acc[key] = [];
    acc[key].push(task);
    return acc;
  }, {});
  const sortedDates = Object.keys(grouped).sort();

  // ── Single unified pass: combine pending + completed, filter by today ──
  const TODAY = getToday();
  const allToday = [...tasks, ...completed].filter(
    (t) => (t.dueDate || TODAY) === TODAY
  );
  const completedToday = allToday.filter((t) => t.done === true);
  const totalToday = allToday.length;          // both pending AND done
  const progressPct =
    totalToday > 0 ? Math.round((completedToday.length / totalToday) * 100) : 0;

  const rowProps = {
    onToggle: handleToggle,
    onDelete: handleDelete,
    onEdit: handleEdit,
    onTimer: handleTimer,
    onDragStart: handleDragStart
  };

  return (
    <div className="fade-in tasks-page">
      <div className="tasks-container">

        {/* HEADER */}
        <div className="tasks-header">
          <div>
            <h1>Tasks</h1>
            <p className="tasks-subtitle">Manage your daily tasks and stay productive.</p>
          </div>
          <button className="btn-primary" onClick={openModal}>
            <Plus size={18} />
            Add New Task
          </button>
        </div>

        {/* PROGRESS */}
        <div className="tasks-progress">
          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${progressPct}%` }} />
          </div>
          <span>{completedToday.length} of {totalToday} tasks completed today</span>
        </div>

        {/* DATE-GROUPED SECTIONS */}
        {sortedDates.map((date) => (
          <React.Fragment key={date}>
            <h6 className="section-label">
              {formatSectionLabel(date)}{" "}
              <span className="section-count">({grouped[date].length})</span>
            </h6>
            <div
              className={`task-card ${dragOverDate === date ? "drop-target" : ""}`}
              onDragOver={(e) => handleDragOver(e, date)}
              onDrop={(e) => handleDrop(e, date)}
            >
              {grouped[date].map((task) => (
                <TaskRow key={task.id} task={task} {...rowProps} />
              ))}
              {grouped[date].length === 0 && (
                <div className="empty-section-drop-hint">Drop here to reschedule</div>
              )}
            </div>
          </React.Fragment>
        ))}

        {/* COMPLETED TODAY */}
        {completed.length > 0 && (
          <>
            <h6 className="section-label">
              COMPLETED TODAY{" "}
              <span className="section-count">({completed.length})</span>
            </h6>
            <div className="task-card">
              {completed.map((task) => (
                <TaskRow key={task.id} task={task} {...rowProps} />
              ))}
            </div>
          </>
        )}
      </div>

      {/* UNDO TOAST */}
      {undoToast && (
        <div className="undo-toast">
          <div className="undo-toast-bar" />
          <div className="undo-toast-body">
            <span className="undo-toast-msg">
              <strong>"{undoToast.task.title}"</strong> deleted
            </span>
            <div className="undo-toast-actions">
              <button className="undo-toast-btn" onClick={handleUndoDelete}>Undo</button>
              <button className="undo-toast-close" onClick={() => setUndoToast(null)}>✕</button>
            </div>
          </div>
        </div>
      )}

      {/* ADD TASK MODAL */}
      {isModalOpen && (
        <div className="modal-backdrop" onClick={closeModal}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">Add New Task</span>
              <button className="modal-close" onClick={closeModal}>✕</button>
            </div>

            <div className="modal-field">
              <label className="modal-label">Title <span className="modal-req">*</span></label>
              <input ref={titleRef} className="modal-input modal-input--focus" placeholder="Task title"
                value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </div>

            <div className="modal-field">
              <label className="modal-label">Category</label>
              <input className="modal-input" placeholder="e.g. Work · Documentation"
                value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
            </div>

            <div className="modal-field">
              <label className="modal-label">Estimated time (min)</label>
              <input className="modal-input" type="number" min={1}
                value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} />
            </div>

            <div className="modal-field">
              <label className="modal-label">Priority</label>
              <div className="modal-seg">
                {["high", "medium", "low"].map((p) => (
                  <button key={p}
                    className={`modal-seg-btn modal-seg-btn--${p}${form.priority === p ? " active" : ""}`}
                    onClick={() => setForm({ ...form, priority: p })}>
                    {p.charAt(0).toUpperCase() + p.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div className="modal-field">
              <label className="modal-label">Due Date</label>
              <input className="modal-input" type="date" min={getToday()}
                value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} />
            </div>

            <div className="modal-footer">
              <button className="modal-btn-cancel" onClick={closeModal}>Cancel</button>
              <button className="modal-btn-add" onClick={handleAddTask} disabled={!form.title.trim()}>
                Add Task
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT TASK MODAL */}
      {editState && (
        <div className="modal-backdrop" onClick={closeEditModal}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">Edit Task</span>
              <button className="modal-close" onClick={closeEditModal}>✕</button>
            </div>

            <div className="modal-field">
              <label className="modal-label">Title <span className="modal-req">*</span></label>
              <input ref={editTitleRef} className="modal-input modal-input--focus" placeholder="Task title"
                value={editForm.title} onChange={(e) => setEditForm({ ...editForm, title: e.target.value })} />
            </div>

            <div className="modal-field">
              <label className="modal-label">Category</label>
              <input className="modal-input" placeholder="e.g. Work · Documentation"
                value={editForm.category} onChange={(e) => setEditForm({ ...editForm, category: e.target.value })} />
            </div>

            <div className="modal-field">
              <label className="modal-label">Estimated time (min)</label>
              <input className="modal-input" type="number" min={1}
                value={editForm.time} onChange={(e) => setEditForm({ ...editForm, time: e.target.value })} />
            </div>

            <div className="modal-field">
              <label className="modal-label">Priority</label>
              <div className="modal-seg">
                {["high", "medium", "low"].map((p) => (
                  <button key={p}
                    className={`modal-seg-btn modal-seg-btn--${p}${editForm.priority === p ? " active" : ""}`}
                    onClick={() => setEditForm({ ...editForm, priority: p })}>
                    {p.charAt(0).toUpperCase() + p.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {editState.source !== "completed" && (
              <div className="modal-field">
                <label className="modal-label">Due Date</label>
                <input className="modal-input" type="date"
                  value={editForm.dueDate}
                  onChange={(e) => setEditForm({ ...editForm, dueDate: e.target.value })} />
              </div>
            )}

            <div className="modal-footer">
              <button className="modal-btn-cancel" onClick={closeEditModal}>Cancel</button>
              <button className="modal-btn-add" onClick={handleSaveEdit} disabled={!editForm.title.trim()}>
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tasks;
