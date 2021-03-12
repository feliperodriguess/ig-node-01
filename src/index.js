const express = require("express");
const cors = require("cors");
const { v4: uuidv4 } = require("uuid");

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;
  const user = users.find((user) => user.username === username);
  if (!user) {
    return response.status(404).json({ error: "User not found." });
  }
  request.user = user;
  return next();
}

app.post("/users", (request, response) => {
  const { name, username } = request.body;
  const userExists = users.find((user) => user.username === username);
  if (userExists) {
    return response.status(400).json({ error: "User already exists." });
  }
  const newUser = {
    id: uuidv4(),
    name,
    username,
    todos: [],
  };
  users.push(newUser);
  return response.status(201).json(newUser);
});

app.get("/todos", checksExistsUserAccount, (request, response) => {
  const todos = request.user.todos;
  return response.json(todos);
});

app.post("/todos", checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const newTodo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date(),
  };
  request.user.todos.push(newTodo);
  return response.status(201).json(newTodo);
});

app.put("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { id: todoId } = request.params;
  const { title, deadline } = request.body;
  const todos = request.user.todos;
  const todo = todos.find((todo) => todo.id === todoId);
  const todoIndex = todos.findIndex((todo) => todo.id === todoId);
  if (!todo) {
    return response.status(404).json({ error: "Todo not found." });
  }
  const updatedTodo = { ...todo, title, deadline };
  const updatedTodos = todos.splice(todoIndex, updatedTodo);
  request.user.todos = updatedTodos;
  return response.json(updatedTodo);
});

app.patch("/todos/:id/done", checksExistsUserAccount, (request, response) => {
  const { id: todoId } = request.params;
  const todos = request.user.todos;
  const todo = todos.find((todo) => todo.id === todoId);
  const todoIndex = todos.findIndex((todo) => todo.id === todoId);
  if (!todo) {
    return response.status(404).json({ error: "Todo not found." });
  }
  const updatedTodo = { ...todo, done: true };
  const updatedTodos = todos.splice(todoIndex, updatedTodo);
  request.user.todos = updatedTodos;
  return response.json(updatedTodo);
});

app.delete("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { id: todoId } = request.params;
  const todos = request.user.todos;
  const todo = todos.find((todo) => todo.id === todoId);
  if (!todo) {
    return response.status(404).json({ error: "Todo not found." });
  }
  const filteredTodos = todos.filter((todo) => todo.id !== todoId);
  request.user.todos = filteredTodos;
  return response.status(204).json();
});

module.exports = app;
