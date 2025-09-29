import React, { useState, useEffect } from "react";
import axios from "axios";

const TaskCard = ({ task, token, onArchive, onRemove, onUnarchive, onAuthError }) => {
  if (!task) return null;

  const { id, text, deadline, progress, total } = task;
  const initialPct = total > 0 ? (progress / total) * 100 : 0;

  // Local state
  const [pct, setPct] = useState(initialPct);
  const [deleted, setDeleted] = useState(false);
  const [archived, setArchived] = useState(task.archived || false);

  // Parse deadline
  const due = deadline ? new Date(deadline) : null;

  // Keep archived flag in sync from localStorage on mount
  useEffect(() => {
    const history = JSON.parse(localStorage.getItem("taskHistory")) || [];
    setArchived(history.some((t) => t.id === id));
  }, [id]);

  // Helper: send PATCH to backend
  const saveToBackend = async (data) => {
    try {
      await axios.patch(
        `http://localhost:5000/api/tasks/${id}`,
        data,
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (err) {
      console.error("Error updating task:", err);
      // CRITICAL FIX: Handle unauthorized error on client action
      if (err.response && err.response.status === 401) {
          onAuthError();
      }
    }
  };

  // Helper: DELETE request
  const deleteOnBackend = async () => {
    try {
      await axios.delete(
        `http://localhost:5000/api/tasks/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (err) {
      console.error("Error deleting task:", err);
      // CRITICAL FIX: Handle unauthorized error on client action
      if (err.response && err.response.status === 401) {
          onAuthError();
      }
    }
  };

  // Update progress (and completed flag if at 100%)
  const updateProgress = async (newPct) => {
    setPct(newPct);
    const newProgress = Math.round((newPct / 100) * total);
    const isComplete = newProgress >= total;
    await saveToBackend({ progress: newProgress, completed: isComplete });
  };

  // Handlers
  const inc = () => updateProgress(Math.min(pct + 100 / total, 100));
  const dec = () => updateProgress(Math.max(pct - 100 / total, 0));

  const removeTask = async () => {
    setDeleted(true);
    await deleteOnBackend();
    onRemove?.(task);
  };

  const archiveTask = async () => {
    await saveToBackend({ archived: true });
    setArchived(true);
    onArchive?.(task);
  };

  const unarchiveTask = async () => {
    await saveToBackend({ archived: false });
    setArchived(false);
    onUnarchive?.(task);
  };

  if (deleted) return null;

  return (
    <div className="p-4 shadow-lg rounded-2xl bg-gray-800 text-white text-center">
      <h2 className="text-xl font-bold mb-2">{text}</h2>
      <p className="text-gray-400">
        Deadline: {due ? due.toDateString() : "No deadline"}
      </p>

      <div className="relative w-24 h-24 mx-auto bg-gray-700 rounded-full overflow-hidden border-4 border-gray-500">
        <div
          className="absolute bottom-0 left-0 w-full bg-blue-500 transition-all duration-300"
          style={{ height: `${pct}%` }}
        />
      </div>
      <p className="mt-2 text-gray-400">Progress: {pct.toFixed(1)}%</p>

      <div className="mt-4 flex justify-center gap-4">
        <button onClick={inc} className="px-4 py-2 bg-green-500 rounded-lg hover:bg-green-600">
          + Progress
        </button>
        <button onClick={dec} className="px-4 py-2 bg-red-500 rounded-lg hover:bg-red-600">
          - Progress
        </button>
      </div>

      {pct >= 100 && (
        <div className="mt-4 flex flex-col gap-2">
          {!archived ? (
            <button onClick={archiveTask} className="px-4 py-2 bg-yellow-500 rounded-lg hover:bg-yellow-600">
              Archive Task
            </button>
          ) : (
            <button onClick={unarchiveTask} className="px-4 py-2 bg-blue-500 rounded-lg hover:bg-blue-600">
              Unarchive Task
            </button>
          )}
          <button onClick={removeTask} className="px-4 py-2 bg-red-500 rounded-lg hover:bg-red-600">
            Remove Task
          </button>
        </div>
      )}
    </div>
  );
};

export default TaskCard;