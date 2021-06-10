'use strict'

const express = require('express')
let todos = [
  { id: 1, title: 'foo', completed: false },
  { id: 2, title: 'bar', completed: true },
]
const app = express()
app.use(express.json())

/**
 * GET:
 *
 * /api/todos
 * /api/todos?completed=true
 */
app.get('/api/todos', (req, res) => {
  if (!req.query.completed) {
    return res.json(todos)
  }

  // completedクエリパラメータを指定された場合はtodoをフィルタリング
  const completed = req.query.completed === 'true'
  res.json(todos.filter((todo) => todo.completed === completed))
})

// todoのid管理
let id = 2

/**
 * POST:
 *
 * /api/todos
 */
app.post('/api/todos', (req, res, next) => {
  const { title } = req.body
  if (typeof title !== 'string' || !title) {
    // titleがリクエストに含まれない場合はステータスコード400(Bad Request)
    const err = new Error('title is required')
    err.statusCode = 400
    return next(err)
  }

  // todoの作成
  const todo = { id: (id += 1), title, completed: false }
  todos.push(todo)
  // ステータスコード201(Created)で返す
  res.status(201).json(todo)
})

app.use((err, _req, res, _next) => {
  console.error(err)
  res.status(err.statusCode || 500).json({ error: err.message })
})

app.listen(3000)
