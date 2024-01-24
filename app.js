const express = require("express");
const sqlite3 = require("sqlite3");
const { format } = require("date-fns");
const app = express();
const { open } = require("sqlite");
const path = require("path");
const dbPath = path.join(__dirname, "todoApplication.db");
let db;
const initializeDb = async () => {
  db = await open({
    filename: dbPath,
    driver: sqlite3.Database,
  });
  app.listen(3000, () => console.log("Server Stared"));
};
initializeDb();

app.get("/todos/", async (request, response) => {
  const {
    status = "",
    priority = "",
    search_q = "",
    category = "",
  } = request.query;
  const query = `
  SELECT id,todo,priority,status,category,due_date as dueDate FROM
  todo
  WHERE
  status LIKE '%${status}%' AND
  priority LIKE '%${priority}%' AND
  todo LIKE '%${search_q}%' AND
  category LIKE '%${category}%'
  `;
  console.log(status, priority, search_q, category);
  const data = await db.all(query);
  response.send(data);
});

app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;

  const query = `
    SELECT id,todo,priority,status,category,due_date as dueDate FROM
  todo
  WHERE
  id=${todoId} `;
  const data = await db.get(query);
  response.send(data);
});
app.use(express.json());

app.get("/agenda/", async (req, res) => {
  const { date } = req.query;
  console.log(date);
  const updatedDate = format(new Date(date), "yyyy-MM-dd");
  console.log("Hi", updatedDate);
  const query = `
    SELECT id,todo,priority,status,category,due_date as dueDate FROM
  todo
  WHERE
  due_date=${updatedDate} `;
  console.log(query);
  const data = await db.all(query);
  res.send(data);
});
