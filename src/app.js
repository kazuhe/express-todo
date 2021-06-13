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

// 全クライアントに対するSSE送信関数を保持する配列
let sseSenders = []
// SSEのIDを管理するための変数
let sseId = 1

/**
 * GET: todoの一覧取得（SSE）
 *
 * /api/todos/events
 */
app.get('/api/todos/events', (req, res) => {
  // タイムアウトを抑止（クライアント側からのリクエストが途切れない）
  req.socket.setTimeout(0)
  res.set({
    'Content-Type': 'text/event-stream',
  })
  // クライアントにSSEを送信する関数を作成して登録
  const send = (id, data) => res.write(`id: ${id}\ndata:${data}\n\n`)
  sseSenders.push(send)
  // リクエスト発生時点の状態を送信（初回）
  send(sseId, JSON.stringify(todos))
  // リクエストがクローズされたらレスポンスを終了してSSE送信関数を配列から削除
  req.on('close', () => {
    res.end()
    sseSenders = sseSenders.filter((_send) => _send !== send)
  })
})

/**
 * todoの更新に伴い、全クライアントに対してSSEを送信する
 */
function onUpdateTodos() {
  sseId += 1
  const data = JSON.stringify(todos)
  sseSenders.forEach((send) => send(sseId, data))
}

/**
 * POST: todoの新規登録
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

  onUpdateTodos()
})

// 指定されたIDのtodoを取得するためのミドルウェア
app.use('/api/todos/:id(\\d+)', (req, res, next) => {
  const targetId = Number(req.params.id)
  const todo = todos.find((todo) => todo.id === targetId)

  if (!todo) {
    const err = new Error('todo not found')
    err.statusCode = 404
    return next(err)
  }

  req.todo = todo
  next()
})

/**
 * PUT:
 * DELETE:
 *
 * /api/todos/:id(\\d+)/completed
 */
app
  .route('/api/todos/:id(\\d+)/completed')
  .put((req, res) => {
    req.todo.completed = true
    res.json(req.todo)
  })
  .delete((req, res) => {
    req.todo.completed = false
    res.json(req.todo)
  })

/**
 * DELETE:
 *
 * /api/todos/:id(\\d+)
 */
app.delete('/api/todos/:id(\\d+)', (req, res) => {
  todos = todos.filter((todo) => todo !== req.todo)
  res.status(204).end() // res.status(204).json()と同義だが意図が伝わりやすい
})

app.use((err, _req, res, _next) => {
  console.error(err)
  res.status(err.statusCode || 500).json({ error: err.message })
})

app.listen(3000)

// ユニバーサルWebアプリケーションでは、ルーティングの挙動もサーバサイドとクライアントサイドで一貫性が必要
// 以降Next.jsによるルーティングの記述
const next = require('next')
const dev = process.env.NODE_ENV !== 'production'
const nextApp = next({ dev })

nextApp.prepare().then(
  // pagesディレクトリ内の各Reactコンポーネントに対するサーバサイドルーティング
  () => app.get('*', nextApp.getRequestHandler()),
  (err) => {
    console.log(err)
    process.exit(1)
  }
)
