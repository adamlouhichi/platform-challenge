const express = require("express");

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

const tasks = [
  { id: 1, title: "Review challenge brief", completed: false }
];

function getNextTaskId() {
  return Math.max(...tasks.map((task) => task.id), 0) + 1;
}

function calculateTotal(items) {
  return items.reduce((total, item) => total + item.price * item.quantity, 0);
}

app.get("/", (_req, res) => {
  res.json({
    service: "devops-platform-challenge",
    status: "ok"
  });
});

app.get("/health", (_req, res) => {
  res.json({ status: "healthy" });
});

app.get("/tasks", (_req, res) => {
  res.json(tasks);
});

app.post("/tasks", (req, res) => {
  const title = typeof req.body.title === "string" ? req.body.title.trim() : "";

  if (!title) {
    return res.status(400).json({ error: "Task title is required" });
  }

  const task = {
    id: getNextTaskId(),
    title,
    completed: false
  };

  tasks.push(task);

  return res.status(201).json(task);
});

app.get("/total", (_req, res) => {
  const items = [
    { price: 10, quantity: 2 },
    { price: 5, quantity: 3 }
  ];

  res.json({ total: calculateTotal(items) });
});

if (require.main === module) {
  app.listen(port, () => {
    console.log(`Application listening on port ${port}`);
  });
}

module.exports = { app, calculateTotal, tasks };
