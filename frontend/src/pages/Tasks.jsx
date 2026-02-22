import React, { useState, useCallback, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "../api/axios";
import { Plus, Clock, Edit2, Trash2, Timer, Loader2 } from "lucide-react";
import { loadTasks, saveTasks, checkDailyGoals } from "../utils/storage";
import { toast } from "react-hot-toast";

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
  const [tasks, setTasks] = useState([]);
  const [completed, setCompleted] = useState([]);
  const [loading, setLoading] = useState(true);
  const [draggedTaskId, setDraggedTaskId] = useState(null);
  const [dragOverDate, setDragOverDate] = useState(null);

  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiClient.get("/tasks");
      const all = res.data.map(t => ({
        ...t,
        done: t.status === "COMPLETED",
        dueDate: t.date // Match frontend expectation
      }));

      const active = all.filter(t => !t.done).sort((a, b) => a.dueDate.localeCompare(b.dueDate) || byPriority(a, b));
      const done = all.filter(t => t.done);

      setTasks(active);
      setCompleted(done);

      // Update local cache
      saveTasks({ tasks: active, completed: done });
    } catch (err) {
      console.error("Failed to fetch tasks:", err);
      // Fallback to local storage if API fails
      const local = loadTasks();
      setTasks(local.tasks || []);
      setCompleted(local.completed || []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const persist = useCallback((t, c) => {
    saveTasks({ tasks: t, completed: c });
    checkDailyGoals();
  }, []);

  /* ---- TOGGLE ---- */
  const handleToggle = useCallback(async (id) => {
    try {
      const res = await apiClient.patch(`/tasks/${id}/toggle`);
      const updated = {
        ...res.data,
        done: res.data.status === "COMPLETED",
        dueDate: res.data.date
      };

      if (updated.done) {
        const nextTasks = tasks.filter(t => t.id !== id);
        const nextCompleted = [...completed, updated];
        setTasks(nextTasks);
        setCompleted(nextCompleted);
        persist(nextTasks, nextCompleted);
      } else {
        const nextCompleted = completed.filter(t => t.id !== id);
        const nextTasks = [...tasks, updated].sort((a, b) => a.dueDate.localeCompare(b.dueDate) || byPriority(a, b));
        setTasks(nextTasks);
        setCompleted(nextCompleted);
        persist(nextTasks, nextCompleted);
      }
    } catch (err) {
      toast.error("Failed to update task");
    }
  }, [tasks, completed, persist]);

  /* ---- DELETE + UNDO ---- */
  const undoRef = useRef(null);
  const [undoToast, setUndoToast] = useState(null);

  const handleDelete = useCallback(async (id) => {
    try {
      await apiClient.delete(`/tasks/${id}`);
      const nextTasks = tasks.filter(t => t.id !== id);
      const nextCompleted = completed.filter(t => t.id !== id);
      setTasks(nextTasks);
      setCompleted(nextCompleted);
      persist(nextTasks, nextCompleted);
      toast.success("Task deleted");
    } catch (err) {
      toast.error("Failed to delete task");
    }
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

  const handleAddTask = useCallback(async () => {
    if (!form.title.trim()) return;
    try {
      const res = await apiClient.post("/tasks", {
        title: form.title.trim(),
        category: form.category.trim() || "General",
        time: `${form.time} min`,
        priority: form.priority,
        date: form.dueDate || getToday()
      });

      const newTask = {
        ...res.data,
        done: res.data.status === "COMPLETED",
        dueDate: res.data.date
      };

      const nextTasks = [...tasks, newTask].sort((a, b) => a.dueDate.localeCompare(b.dueDate) || byPriority(a, b));
      setTasks(nextTasks);
      persist(nextTasks, completed);
      closeModal();
      toast.success("Task added");
    } catch (err) {
      toast.error("Failed to add task");
    }
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

  const handleSaveEdit = useCallback(async () => {
    if (!editForm.title.trim() || !editState) return;
    try {
      // Backend doesn't have a generic PUT/PATCH edit yet, let's assume it supports full update or I should add it.
      // Wait, TaskController only has toggle and delete. I need to add an update endpoint.
      // For now, I'll delete and re-create if no PUT exists, OR I'll add the PUT endpoint.
      // Adding a PUT endpoint is cleaner.

      const res = await apiClient.put(`/tasks/${editState.task.id}`, {
        title: editForm.title.trim(),
        category: editForm.category.trim() || "General",
        time: `${editForm.time} min`,
        priority: editForm.priority,
        date: editForm.dueDate || getToday(),
        status: editState.source === "completed" ? "COMPLETED" : "ACTIVE"
      });

      const updatedTask = {
        ...res.data,
        done: res.data.status === "COMPLETED",
        dueDate: res.data.date
      };

      const nextTasks = tasks.filter(t => t.id !== updatedTask.id);
      const nextCompleted = completed.filter(t => t.id !== updatedTask.id);

      if (updatedTask.done) {
        setCompleted([...nextCompleted, updatedTask]);
        setTasks(nextTasks);
        persist(nextTasks, [...nextCompleted, updatedTask]);
      } else {
        const sorted = [...nextTasks, updatedTask].sort((a, b) => a.dueDate.localeCompare(b.dueDate) || byPriority(a, b));
        setTasks(sorted);
        setCompleted(nextCompleted);
        persist(sorted, nextCompleted);
      }
      closeEditModal();
      toast.success("Task updated");
    } catch (err) {
      toast.error("Failed to update task");
    }
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

  if (loading) {
    return (
      <div className="tasks-page d-flex align-items-center justify-content-center" style={{ minHeight: '80vh' }}>
        <div className="text-center">
          <Loader2 className="spinner-border text-teal mb-3 animate-spin" size={40} />
          <p className="text-muted fw-medium">Loading your tasks...</p>
        </div>
      </div>
    );
  }

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
