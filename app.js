const express = require("express");
const sqlite3 = require("sqlite3");
const { format, isValid, parseISO } = require("date-fns");
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
SELECT id,todo,priority,status,category,due_date as dueDate 
FROM
  todo
  WHERE
  id=${todoId} `;
  const data = await db.get(query);
  response.send(data);
});
app.use(express.json());

app.get("/agenda/", async (req, res) => {
  const { date } = req.query;
  const parsedDate = parseISO(date);
  if (isValid(parsedDate)) {
    console.log(isValid(parsedDate));
    const updatedDate = format(new Date(date), "yyyy-MM-dd");
    console.log("Hi", updatedDate);
    const query = `
    SELECT id,todo,priority,status,category,due_date as dueDate FROM
  todo
  WHERE
  due_date='${updatedDate}' `;
    console.log(query);
    const data = await db.all(query);
    res.send(data);
  } else {
    res.status(400);
    res.send("Invalid Due Date");
  }
});

app.post("/todos/", async (request, response) => {
  const { id, todo, priority, status, category, dueDate } = request.body;
  const query = `
  INSERT INTO todo(id,todo,priority,status,category,due_date)
  values(${id},'${todo}','${priority}','${status}','${category}','${dueDate}')
  `;
  const data = await db.run(query);
  console.log(data);
  response.send("Todo Successfully Added");
});

app.put("/todos/:todoId/", async (req, res) => {
  const {
    status = "",
    priority = "",
    todo = "",
    category = "",
    duDate = "",
  } = req.body;
  const { todoId } = req.params;
  if (status !== "") {
    const validStatus = ["TO DO", "IN PROGRESS", "DONE"];
    if (!validStatus.includes(status)) {
      res.status(400);
      res.send("Invalid Todo Status");
    } else {
      const query = `
        UPDATE todo
        SET
        status='${status}'
        WHERE
        id=${todoId}`;
      await db.run(query);
      res.send("Status Updated");
    }
  } else if (priority !== "") {
    const validPriority = ["HIGH", "LOW", "MEDIUM"];
    if (!validPriority.includes(priority)) {
      res.status(400);
      res.send("Invalid Todo Priority");
    } else {
      const query = `
        UPDATE todo
        SET
        priority='${priority}'
        WHERE
        id=${todoId}`;
      await db.run(query);
      res.send("Priority Updated");
    }
  } else if (todo !== "") {
    const query = `
        UPDATE todo
        SET
        todo='${todo}'
        WHERE
        id=${todoId}`;
    await db.run(query);
    res.send("Todo Updated");
  } else if (category !== "") {
    const validCategory = ["WORK", "HOME", "DONE"];
    if (!validCategory.includes(category)) {
      res.status(400);
      res.send("Invalid Todo Category");
    } else {
      const query = `
        UPDATE todo
        SET
        category='${category}'
        WHERE
        id=${todoId}`;
      await db.run(query);
      res.send("Category Updated");
    }
  } else if (dueDate !== "") {
    const query = `
        UPDATE todo
        SET
        due_date='${dueDate}'
        WHERE
        id=${todoId}`;
    await db.run(query);
    res.send("Due Date Updated");
  }
});

app.delete("/todos/:todoId", async (req, res) => {
  const { todoId } = req.params;
  const query = `
    DELETE FROM
    todo
    WHERE
    id=${todoId}`;
  await db.run(query);
  res.send("Todo Deleted");
});

module.exports = app;
