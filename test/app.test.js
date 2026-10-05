const test = require("node:test");
const assert = require("node:assert/strict");
const { app, calculateTotal } = require("../src/app");

async function request(path, options = {}) {
  const server = app.listen(0);

  try {
    const { port } = server.address();
    return await fetch(`http://127.0.0.1:${port}${path}`, options);
  } finally {
    server.close();
  }
}

async function get(path) {
  return request(path);
}

async function post(path, body) {
  return request(path, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  });
}

test("calculates the total for several items", () => {
  const items = [
    { price: 10, quantity: 2 },
    { price: 5, quantity: 3 }
  ];

  assert.equal(calculateTotal(items), 35);
});

test("returns zero for an empty basket", () => {
  assert.equal(calculateTotal([]), 0);
});

test("does not mutate the input items", () => {
  const items = [{ price: 4, quantity: 2 }];
  const copy = JSON.parse(JSON.stringify(items));

  calculateTotal(items);

  assert.deepEqual(items, copy);
});

test("returns all tasks", async () => {
  const response = await get("/tasks");
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.ok(Array.isArray(body));
  assert.ok(body.length > 0);

  for (const task of body) {
    assert.equal(typeof task.id, "number");
    assert.equal(typeof task.title, "string");
    assert.equal(typeof task.completed, "boolean");
  }
});

test("creates a task", async () => {
  const response = await post("/tasks", { title: "Write CI notes" });
  const body = await response.json();

  assert.equal(response.status, 201);
  assert.equal(typeof body.id, "number");
  assert.equal(body.title, "Write CI notes");
  assert.equal(body.completed, false);
});

test("generates a unique ID for each new task", async () => {
  const firstResponse = await post("/tasks", { title: "First task" });
  const secondResponse = await post("/tasks", { title: "Second task" });
  const firstTask = await firstResponse.json();
  const secondTask = await secondResponse.json();

  assert.notEqual(firstTask.id, secondTask.id);
});

test("rejects an empty task title", async () => {
  const response = await post("/tasks", { title: "   " });
  const body = await response.json();

  assert.equal(response.status, 400);
  assert.equal(body.error, "Task title is required");
});
