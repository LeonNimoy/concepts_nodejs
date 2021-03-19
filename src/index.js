const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const {username} = request.headers;

  const user = users.find((user) => user.username === username);

  if(!user) {
    response.status(404).json({error: "User not found!"})
  }

  request.username = user;
  
  next()  
}

app.post('/users', (request, response) => {
  const {name, username} = request.body;

  const user = users.find((user) => user.username === username);

  if(user) {
    response.status(400).json({error: "User already exist!"})
  }

  const newUser = {
    id: uuidv4(), 
	 name, 
	 username, 
	 todos: []
  }

  users.push(newUser)

  return response.status(201).json(newUser);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  
  const {username} = request;

  const userTodos = username.todos;

  return response.status(200).json(userTodos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const {title, deadline} = request.body;
  const {username} = request;

  const userNewTodo = {
      id: uuidv4(), 
     title, 
     done:false,
     deadline: new Date(deadline), 
     created_at: new Date(),
    
  }
  
  username.todos.push(userNewTodo)

  return response.status(201).json(userNewTodo);

});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const {username} = request;
  const {title, deadline} = request.body;
  const {id} = request.params;


  const todo = username.todos.find((todo) => todo.id === id );

  if(!todo) {
    response.status(404).json({error: "Todo not found!"})
  }

  todo.title = title;
  todo.deadline = new Date(deadline);

  return response.status(200).json(todo);
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const {username} = request;
  const {id} = request.params;
  
  const todo = username.todos.find((todo) => todo.id === id );

  if(!todo) {
    response.status(404).json({error: "Todo not found!"})
  }
  
  todo.done = true;

  return response.status(200).json(todo);
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const {username} = request;
  const {id} = request.params;


  const todo = username.todos.find((todo) => todo.id === id );

  if(!todo) {
    response.status(404).json({error: "Todo not found!"})
  }

  username.todos.splice(todo, 1);

  return response.status(204).send();
  
});

module.exports = app;