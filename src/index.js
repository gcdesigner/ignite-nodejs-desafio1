const express = require('express');
const cors = require('cors');
const { v4: uuidV4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

/**
 * id: uuid,
 * name: string,
 * username: string
 * todos: Array<{
 *  id: uuid,
 *  title: string,
 *  done: boolean,
 *  deadline: Date,
 *  created_at: Date
 * }>
 */
const users = []

// Middleware
function checkExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const user = users.find(user => user.username === username)

  if (!user) {
    return response.status(404).json({ error: 'User not found' });
  }

  request.user = user;

  return next();
}

// USER ROUTE
app.post('/users', (request, response) => {
  const { name, username } = request.body;

  const userAlreadyExists = users.some(user => user.username === username);

  if (userAlreadyExists) {
    return response.status(400).json({ error: 'User already exists!' })
  }

  const user = {
    id: uuidV4(),
    name,
    username,
    todos: []
  }

  users.push(user)

  return response.status(201).json(user);
})

app.get('/users', (request, response) => {
  return response.json(users);
})

// TODO ROUTE
app.post('/todos', checkExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const { user } = request;

  if (!title || !deadline) {
    return response.status(400).json({ error: 'No title or deadline information.' })
  }

  const todo = {
    id: uuidV4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  }

  user.todos.push(todo);

  return response.status(201).json(todo);
})

app.get('/todos', checkExistsUserAccount, (request, response) => {
  const { user } = request;
  return response.json(user.todos);
})

app.put('/todos/:id', checkExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { title, deadline } = request.body;
  const { user } = request;

  const todo = user.todos.find(todo => todo.id === id);

  if (!todo) {
    return response.status(404).json({ error: 'Todo not found!' })
  }

  todo.title = title;
  todo.deadline = new Date(deadline);

  return response.json(todo);
})

app.patch('/todos/:id/done', checkExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const todo = user.todos.find(todo => todo.id === id);

  if (!todo) {
    return response.status(404).json({ error: 'Todo not found!' })
  }

  todo.done = true;

  return response.json(todo)
})

app.delete('/todos/:id', checkExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const todo = user.todos.find(todo => todo.id === id);

  if (!todo) {
    return response.status(404).json({ error: 'Todo not found!' })
  }

  user.todos.splice(todo, 1);

  return response.status(204).send();
})

module.exports = app;