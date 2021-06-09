'use strict'

const express = require('express')
let todos = [
  { id: 1, title: 'foo', completed: false },
  { id: 2, title: 'bar', completed: true },
]
const app = express()

app.get('/api/todos', (req, res) => res.json(todos))

app.listen(3000)
