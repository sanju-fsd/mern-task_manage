import { useEffect, useState } from "react";
import API from "../services/api";
import TaskItem from "../components/TaskItem";
import Header from "../components/Header";

export default function Dashboard() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Fetch tasks
  const fetchTasks = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await API.get("/tasks");
      setTasks(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load tasks");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  // Add task
  const addTask = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await API.post("/tasks", { title });
      setTasks([res.data, ...tasks]);
      setTitle("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add task");
    }
  };

  // Update task
  const updateTask = async (id, updatedData) => {
    setError("");
    try {
      const res = await API.put(`/tasks/${id}`, updatedData);
      setTasks(tasks.map((t) => (t._id === id ? res.data : t)));
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update task");
    }
  };

  // Delete task
  const deleteTask = async (id) => {
    setError("");
    try {
      await API.delete(`/tasks/${id}`);
      setTasks(tasks.filter((t) => t._id !== id));
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete task");
    }
  };

  // Toggle task
  const toggleTask = async (id, completed) => {
    await updateTask(id, { completed });
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold mb-6 text-gray-800">My Tasks</h2>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          {/* Add Task Form */}
          <form onSubmit={addTask} className="flex gap-2 mb-6">
            <input
              className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Add a new task..."
              required
            />
            <button
              type="submit"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Add Task
            </button>
          </form>

          {/* Loading State */}
          {loading && (
            <div className="text-center py-8">
              <p className="text-gray-500">Loading tasks...</p>
            </div>
          )}

          {/* Task List */}
          {!loading && tasks.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No tasks yet. Add one above! 👆</p>
            </div>
          ) : (
            <ul className="space-y-3">
              {tasks.map((task) => (
                <TaskItem
                  key={task._id}
                  task={task}
                  onDelete={deleteTask}
                  onToggle={toggleTask}
                  onUpdate={updateTask}
                />
              ))}
            </ul>
          )}

          {/* Task Count */}
          {!loading && tasks.length > 0 && (
            <div className="mt-6 pt-4 border-t text-sm text-gray-500">
              Total: {tasks.length} task{tasks.length !== 1 ? "s" : ""} | 
              Completed: {tasks.filter((t) => t.completed).length} | 
              Pending: {tasks.filter((t) => !t.completed).length}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
