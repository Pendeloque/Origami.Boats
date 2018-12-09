require('babel-register');
const chalk = require('chalk');
const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');
const Koa = require('koa');
const serve = require('koa-static');
// const websockify = require('koa-websocket');
const Router = require('koa-router');
const cors = require('@koa/cors');
const bodyParser = require('koa-bodyparser');
const wss = require('ws').Server;

// const ws = new wss({ port: 1338 });
const app = new Koa();
const api = new Router();

// ws.on('connection', w => {
function saveFile(content) {
  return new Promise(resolve => {
    const objData = content.data;
    const filename = content.hash;
    fs.writeFile(path.join('obj', `${filename}.obj`), objData, err => {
      resolve();
    });
  });
}

api.post('/', async (ctx, next) => {
  const content = ctx.request.body;
  console.log(chalk.inverse('------------ POST Request ------------'));
  console.log(chalk.blue(content.hash));
  console.log(chalk.magenta(content.message));
  console.log(chalk.inverse('--------------------------------------\n'));
  await saveFile(content);
  ctx.status = 200;
});

app
  .use(bodyParser())
  .use(
    cors({
      allowMethods: 'GET,HEAD,PUT,POST,DELETE,PATCH',
      origin: '*'
    })
  )
  .use(api.routes())
  .use(serve(__dirname + '/static'))
  .on('error', err => {
    console.error('server error', err);
  });

http.createServer(app.callback()).listen(1337);
console.log('Listening on Port: 1337');
