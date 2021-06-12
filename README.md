## express-todo
Express todo app.

## How to use

``` bash
$ yarn start
```

## Commit Message Guidelines

```bash
$ git commit -m '<Prefix>: Message here...'
```

> 🐥  Prefix

- chore: プロダクションコードに変更を加えない作業
- docs: ドキュメントの修正、更新
- feat: 新機能の実装
- fix: バグ修正
- perf: パフォーマンスを向上させるコードの変更
- refactor: バグ修正や機能追加ではないコードの変更
- style: 空白、書式設定、セミコロンの欠落など
- test: テストの追加、修正

## Debug
```bash
node --experimental-repl-await
> require('isomorphic-fetch')

> await fetch('http://localhost:3000/api/todos')
> await fetch("http://localhost:3000/api/todos", {method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ title: "test" })})
> await fetch("http://localhost:3000/api/todos", {method: "PUT"})

> console.log(_.status, await _.json())
```
