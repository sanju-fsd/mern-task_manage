const Task = require("../models/Task");


exports.getTasks = async (req, res) => {
  const tasks = await Task.find({ user: req.user._id });
  res.json(tasks);
};

exports.createTask = async (req, res) => {
  const task = await Task.create({
    user: req.user._id,
    title: req.body.title,
  });

  res.status(201).json(task);
};


exports.updateTask = async (req, res) => {
  const task = await Task.findById(req.params.id);

  if (!task) return res.status(404).json({ msg: "Task not found" });

  if (task.user.toString() !== req.user._id.toString()) {
    return res.status(401).json({ msg: "Not authorized" });
  }

  task.title = req.body.title || task.title;
  task.completed =
    req.body.completed !== undefined
      ? req.body.completed
      : task.completed;

  const updatedTask = await task.save();
  res.json(updatedTask);
};

exports.deleteTask = async (req, res) => {
  const task = await Task.findById(req.params.id);

  if (!task) return res.status(404).json({ msg: "Task not found" });

  if (task.user.toString() !== req.user._id.toString()) {
    return res.status(401).json({ msg: "Not authorized" });
  }

  await task.deleteOne();
  res.json({ msg: "Task removed" });
};
