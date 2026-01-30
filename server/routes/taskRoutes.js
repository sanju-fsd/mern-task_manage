const express = require("express");
const router = express.Router();
const Task = require("../models/Task");
const auth = require("../middleware/authMiddleware");
const admin = require("../middleware/adminMiddleware");


router.get("/", auth, async (req, res) => {
  try {
    const tasks = await Task.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(tasks);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch tasks" });
  }
});


router.post("/", auth, async (req, res) => {
  try {
    const { title } = req.body;

    if (!title || title.trim() === "") {
      return res.status(400).json({ message: "Title is required" });
    }

    const task = await Task.create({
      title: title.trim(),
      user: req.user._id,
    });

    res.status(201).json(task);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to add task" });
  }
});


router.put("/:id", auth, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    if (task.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    task.title = req.body.title !== undefined ? req.body.title.trim() : task.title;
    task.completed = req.body.completed !== undefined ? req.body.completed : task.completed;

    const updatedTask = await task.save();
    res.json(updatedTask);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update task" });
  }
});

router.delete("/:id", auth, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    
    if (task.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await task.deleteOne();
    res.json({ message: "Task deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete task" });
  }
});

// Admin routes
router.get("/admin/all", auth, admin, async (req, res) => {
  try {
    const tasks = await Task.find()
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    const grouped = {};
    tasks.forEach((task) => {
      const userId = task.user._id.toString();
      if (!grouped[userId]) {
        grouped[userId] = { user: task.user, tasks: [] };
      }
      grouped[userId].tasks.push(task);
    });

    res.json(Object.values(grouped));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to load admin tasks" });
  }
});


router.post("/admin", auth, admin, async (req, res) => {
  try {
    const { title, userId } = req.body;

    if (!title || title.trim() === "") {
      return res.status(400).json({ message: "Title is required" });
    }

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const task = await Task.create({
      title: title.trim(),
      user: userId,
    });

    const populatedTask = await Task.findById(task._id).populate("user", "name email");
    res.status(201).json(populatedTask);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to create task" });
  }
});


router.put("/admin/:id", auth, admin, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    task.title = req.body.title !== undefined ? req.body.title.trim() : task.title;
    task.completed = req.body.completed !== undefined ? req.body.completed : task.completed;

    const updatedTask = await task.save();
    const populatedTask = await Task.findById(updatedTask._id).populate("user", "name email");
    res.json(populatedTask);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update task" });
  }
});


router.delete("/admin/:id", auth, admin, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    await task.deleteOne();
    res.json({ message: "Task deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete task" });
  }
});

module.exports = router;
