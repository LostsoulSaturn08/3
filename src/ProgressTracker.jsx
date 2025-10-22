import React, { useState, useEffect } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import Profile from "./Profile";
import Login from "./Login";
import TaskCard from "./TaskCard";
import axios from "axios";
console.log("ProgressTracker.jsx loaded");

// Helper function to initialize state directly from localStorage
const getInitialUserState = () => {
  const storedUser = localStorage.getItem('user');
  const storedToken = localStorage.getItem('token');

  if (storedUser && storedToken) {
    try {
      console.log("Found stored user and token, attempting to parse.");
      const user = JSON.parse(storedUser);
      const profile = { ...user, token: storedToken };
      return {
        loggedIn: true,
        profile: profile,
      };
    } catch (e) {
      console.error("Failed to parse stored user data, clearing session:", e);
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    }
  }
  return {
    loggedIn: false,
    profile: null,
  };
};

const ProgressTracker = () => {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState("");
  const [deadline, setDeadline] = useState(new Date());
  const [taskDuration, setTaskDuration] = useState(1);
  
  const initialUserState = getInitialUserState();
  const [profile, setProfile] = useState(initialUserState.profile);
  const [loggedIn, setLoggedIn] = useState(initialUserState.loggedIn);
  
  const handleAuthError = () => {
    console.log("Session token expired or invalid, forcing logout.");
    setLoggedIn(false);
    setProfile(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  const handleLogin = (data) => {
    const { user, token } = data;
    setProfile({ ...user, token });
    setLoggedIn(true);
    console.log("Login successful, user profile set.");
    console.log("User saved to localStorage:", localStorage.getItem("user"));
    console.log("Token saved to localStorage:", localStorage.getItem("token"));
  };

  const addTaskHandler = async () => {
    if (!newTask.trim()) return;
    if (!profile?.token) return handleAuthError(); 

    const payload = {
      text: newTask,
      completed: false,
      deadline: deadline.toISOString(),
      progress: 0,
      total: taskDuration,
    };

    try {
      const response = await axios.post(
        "http://localhost:5000/api/tasks",
        payload,
        { headers: { Authorization: `Bearer ${profile.token}` } }
      );
      setTasks((prev) => [...prev, response.data]);
    } catch (error) {
      console.error("Error saving task:", error);
      if (error.response && error.response.status === 401) {
        handleAuthError();
      }
    }

    setNewTask("");
    setTaskDuration(1);
  };

  const handleRemove = (removedTask) => {
    setTasks((prev) => prev.filter((t) => t.id !== removedTask.id));
  };

  // ✅ Dummy archive/unarchive handlers (prevent crash)
  const handleArchive = (archivedTask) => {
    console.log("Archive clicked:", archivedTask);
  };

  const handleUnarchive = (unarchivedTask) => {
    console.log("Unarchive clicked:", unarchivedTask);
  };

  useEffect(() => {
    if (!loggedIn || !profile?.token) return;

    const fetchTasks = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/tasks", {
          headers: { Authorization: `Bearer ${profile.token}` },
        });
        setTasks(res.data);
      } catch (err) {
        console.error("Fetch tasks failed:", err);
        if (err.response && err.response.status === 401) {
          handleAuthError();
        }
      }
    };
    
    fetchTasks();
  }, [profile?.token]); 
  
  useEffect(() => {
    if (!loggedIn) {
      setTasks([]);
    }
  }, [loggedIn]);

  return (
    <div className="relative p-4 bg-black text-white min-h-screen font-mono">
      <h1 className="text-4xl mb-6 border-b-2 border-blue-500 pb-2">
        Progress Tracker
      </h1>

      {!loggedIn ? (
        <Login onLogin={handleLogin} />
      ) : (
        <>
          <div className="p-4">
            <Profile
              user={profile}
              onLogout={handleAuthError} 
              onAuthError={handleAuthError} 
            />
          </div>

          <div className="flex flex-wrap gap-4 mb-6 items-center">
            <input
              type="text"
              className="p-3 text-black rounded-lg border border-blue-500 w-full md:w-1/3"
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              placeholder="Enter new quest..."
            />
            <input
              type="number"
              className="p-3 text-black rounded-lg border border-blue-500 w-full md:w-1/6"
              value={taskDuration}
              onChange={(e) => setTaskDuration(parseInt(e.target.value, 10))}
              placeholder="Duration/Iterations"
            />
            <div className="w-full md:w-auto">
              <div className="border border-blue-500 bg-gray-800 p-4 rounded-lg shadow-lg">
                <Calendar
                  onChange={setDeadline}
                  value={deadline}
                  className="w-full max-w-xs text-lg font-bold rounded-lg"
                />
              </div>
            </div>
            <button
              className="bg-blue-600 px-4 py-2 rounded-lg shadow-lg w-full md:w-auto"
              onClick={addTaskHandler}
            >
              Add Quest
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                token={profile.token}
                onRemove={handleRemove}
                onArchive={handleArchive}   
                onUnarchive={handleUnarchive} 
                onAuthError={handleAuthError} 
              />
            ))}
          </div>
        </>
      )}

      <style>{`
        .react-calendar { background-color: #1f2937 !important; color: white !important; border-radius: 8px; }
        .react-calendar__tile { color: white !important; }
        .react-calendar__navigation button { color: white !important; }
      `}</style>
    </div>
  );
};

export default ProgressTracker;
