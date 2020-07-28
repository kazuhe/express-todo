'use strict';

// デバッグ用のログを表示
const debug = require('debug');　
const debugInfo = debug('module:info');
// setInterval(() => {
//   debugInfo('some information.');
// }, 1000);
const debugError = debug('module:error');
// setInterval(() => {
//   debugError('some error.');
// }, 1000);

var createError = require('http-errors'); // HTTPのエラーを作成するモジュール
var express = require('express'); // Express本体
var path = require('path');
var cookieParser = require('cookie-parser'); // Cookieを解釈するモジュール
var logger = require('morgan'); // コンソールにログを整形して出力するモジュール
const helmet = require('helmet'); // HTTPヘッダーを設定するセキュリティモジュール

var app = express();
app.use(helmet());

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public'))); // 静的ファイルのディレクトリ設定

// ルーティング設定
const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
app.use('/', indexRouter);
app.use('/users', usersRouter);

// 404設定
app.use(function(req, res, next) {
  // next関数で次の(リクエストのハンドラが登録されていれば)ハンドラが引き続き呼び出される
  next(createError(404));
});

// Error設定
app.use(function(err, req, res, next) {
  // 開発環境の場合のみエラーオブジェクトをテンプレートに渡す
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // Errorページを表示
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
