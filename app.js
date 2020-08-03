'use strict';

require('dotenv').config();

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

// GitHubを使った外部認証設定
const session = require('express-session');
const passport = require('passport'); // 他のWebサービスとの外部認証を組み込むためのライブラリ
const GitHubStrategy = require('passport-github2').Strategy;
const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID;
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;
passport.serializeUser((user, done) => {
  // ユーザー情報をデータとして保存する処理
  done(null, user);
});
passport.deserializeUser((obj, done) => {
  // 保存されたデータをユーザー情報として読み出す処理
  done(null, obj);
});
passport.use(new GitHubStrategy({
  clientID: GITHUB_CLIENT_ID,
  clientSecret: GITHUB_CLIENT_SECRET,
  callbackURL: 'http://localhost:8000/auth/github/callback'
},
(accessToken, refreshToken, profile, done) => {
  process.nextTick(() => {
    // 現在の処理が終わった後のタイミングでコールバック関数を実行
    return done(null, profile);
  });
}
));
app.use(
  session({
    secret: '417cce55dcfcfaeb',
    resave: false,
    saveUninitialized: false
  })
);
app.use(passport.initialize());
app.use(passport.session());

// ルーティング設定
const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
app.use('/', indexRouter);
app.use('/users', ensureAuthenticated, usersRouter);
app.get('/auth/github',
  passport.authenticate('github', { scope: ['user:email'] }),
  function (req, res) {
});
app.get('/auth/github/callback',
  passport.authenticate('github', { failureRedirect: '/login' }),
  function (req, res) {
    res.redirect('/');
});
app.get('/login', function (req, res) {
  res.render('login');
});
function ensureAuthenticated(req, res, next) {
  // 認証してなければ/loginへリダイレクト
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/login');
}
app.get('/logout', function (req, res) {
  req.logout();
  res.redirect('/');
});

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
