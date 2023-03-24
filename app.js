/*
 * @Descripttion: 郭少的代码
 * @version: 1.0.0
 * @Author: 郭少
 * @Date: 2021-06-05 23:45:55
 * @LastEditors: 郭少
 * @LastEditTime: 2021-06-08 14:44:26
 */
const Koa = require('koa')
const app = new Koa()
const views = require('koa-views')
const json = require('koa-json')
const onerror = require('koa-onerror')
const bodyparser = require('koa-bodyparser')
const jwt = require('koa-jwt')
const logger = require('koa-logger')
const cors = require('koa-cors');
const Routers = require('./routes/index')
const secret = require('./config/secret')
const jwtToken = require('./middleware/JWTToken')
const jwtFilter = require('./middleware/JWTFilter')
const socketServer = require('./utils/webSocket')
// error handler
onerror(app)
app.use(jwtToken())
app.use(cors());

// 此接口列表，过滤不用jwt验证
app.use(jwt({
  secret: secret.sign
}).unless({
  path: jwtFilter
}))

app.use(bodyparser({
  enableTypes: ['json', 'form', 'text'],
  formLimit: '1mb'
}))
app.use(json())
app.use(logger())
app.use(require('koa-static')(__dirname + '/public'))

app.use(views(__dirname + '/views', {
  extension: 'pug'
}))

// logger
app.use(async (ctx, next) => {
  const start = new Date()
  await next()
  const ms = new Date() - start
  console.log(`${ctx.method} ${ctx.url} - ${ms}ms`)
})

// routes
app.use(Routers.routes(), Routers.allowedMethods())

// error-handling
app.on('error', (err, ctx) => {
  console.error('server error', err, ctx)
});

module.exports = app
