import { useEffect, useState } from "react";
import API from "../services/api";
import Header from "../components/Header";
import { Link } from "react-router-dom";

export default function AdminTasks() {
  const [data, setData] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    userId: "",
    completed: false
  });

  useEffect(() => {
    fetchTasks();
    fetchUsers();
  }, []);

  const fetchTasks = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await API.get("/tasks/admin/all");
      setData(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load tasks");
    }
    setLoading(false);
  };

  const fetchUsers = async () => {
    try {
      const res = await API.get("/users");
      setUsers(res.data);
    } catch (err) {
      console.error("Failed to load users:", err);
    }
  };

  const handleOpenModal = (task = null, userId = null) => {
    if (task) {
      setEditingTask(task);
      setFormData({
        title: task.title,
        userId: task.user._id || task.user,
        completed: task.completed
      });
    } else {
      setEditingTask(null);
      setFormData({
        title: "",
        userId: userId || "",
        completed: false
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingTask(null);
    setFormData({
      title: "",
      userId: "",
      completed: false
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      if (editingTask) {
        // Update task
        await API.put(`/tasks/admin/${editingTask._id}`, {
          title: formData.title,
          completed: formData.completed
        });
      } else {
        // Create task
        await API.post("/tasks/admin", {
          title: formData.title,
          userId: formData.userId
        });
      }
      await fetchTasks();
      handleCloseModal();
    } catch (err) {
      setError(err.response?.data?.message || "Operation failed");
    }
  };

  const handleDelete = async (taskId) => {
    if (!window.confirm("Are you sure you want to delete this task?")) {
      return;
    }

    setError("");
    try {
      await API.delete(`/tasks/admin/${taskId}`);
      await fetchTasks();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete task");
    }
  };

  const handleToggleComplete = async (taskId, completed) => {
    try {
      await API.put(`/tasks/admin/${taskId}`, { completed: !completed });
      await fetchTasks();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update task");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Header />
        <div className="p-6">
          <p>Loading tasks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">All Tasks (Grouped by User)</h1>
          <div className="flex gap-3">
            <Link
              to="/admin"
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Back to Dashboard
            </Link>
            <button
              onClick={() => handleOpenModal()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              + Add Task
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        {data.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-md">
            <p className="text-gray-500">No tasks found</p>
          </div>
        ) : (
          <div className="space-y-6">
            {data.map((group) => (
              <div
                key={group.user._id}
                className="bg-white rounded-lg shadow-md p-6"
              >
                {/* USER INFO */}
                <div className="border-b pb-3 mb-4 flex justify-between items-center">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-800">
                      {group.user.name}
                    </h2>
                    <p className="text-sm text-gray-500">
                      {group.user.email}
                    </p>
                  </div>
                  <button
                    onClick={() => handleOpenModal(null, group.user._id)}
                    className="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 text-sm"
                  >
                    + Add Task
                  </button>
                </div>

                {/* TASK LIST */}
                <ul className="space-y-2">
                  {group.tasks.map((task) => (
                    <li
                      key={task._id}
                      className="flex items-center justify-between bg-gray-50 p-3 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <input
                          type="checkbox"
                          checked={task.completed}
                          onChange={() => handleToggleComplete(task._id, task.completed)}
                          className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 cursor-pointer"
                        />
                        <span
                          className={`flex-1 ${
                            task.completed
                              ? "line-through text-gray-400"
                              : "text-gray-800"
                          }`}
                        >
                          {task.title}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span
                          className={`text-xs px-2 py-1 rounded ${
                            task.completed
                              ? "bg-green-100 text-green-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {task.completed ? "Done" : "Pending"}
                        </span>
                        <button
                          onClick={() => handleOpenModal(task)}
                          className="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 text-sm"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(task._id)}
                          className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 text-sm"
                        >
                          Delete
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>

                {group.tasks.length === 0 && (
                  <p className="text-sm text-gray-500 text-center py-4">
                    No tasks for this user
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4">
              {editingTask ? "Edit Task" : "Add New Task"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              {!editingTask && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    User
                  </label>
                  <select
                    value={formData.userId}
                    onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select a user</option>
                    {users.map((user) => (
                      <option key={user._id} value={user._id}>
                        {user.name} ({user.email})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Task Title
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              {editingTask && (
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.completed}
                    onChange={(e) => setFormData({ ...formData, completed: e.target.checked })}
                    className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <label className="text-sm font-medium text-gray-700">
                    Completed
                  </label>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {editingTask ? "Update" : "Create"}
                </button>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
