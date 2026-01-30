const express = require("express");
const cors = require("cors");

const app = express();
require("dotenv").config();
const DB_CONNECT = require("./config/db");
DB_CONNECT();

app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/tasks", require("./routes/taskRoutes"));
app.use("/api/users", require("./routes/userRoutes"));

app.get("/", (req, res) => {
  res.json({
    message: "API is working.."
  });
});


app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong!" });
});


app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// SERVER
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
