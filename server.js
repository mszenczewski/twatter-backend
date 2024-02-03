const express = require('express');
const mongoose = require('mongoose');
const app = express();
const session = require('client-sessions');
const bodyParser = require('body-parser');

const argv = validate_argv();

console.log(`[args] logging in ${argv.log} mode`);
console.log(`[args] listening on port ${argv.port}`);
console.log(`[args] using ${argv.mail} as mail server`);
console.log(`[args] using ${argv.mongo} as mongo server`);

var mongooseCache = require('mongoose-redis');
var cache = mongooseCache(mongoose, "redis://localhost:6379");

mongoose.Promise = global.Promise;

const mongo_url = `mongodb://${argv.mongo}:27017/twatter-sharded`;

mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);

mongoose.connect(mongo_url, {useNewUrlParser: true, useUnifiedTopology: true});

require('./api/models/item');
require('./api/models/user');
require('./api/models/media');

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

app.use(session({
  cookieName: 'session',
  secret: 'ax86nsob7jeu48gks',
  duration: 30 * 60 * 1000,
  activeDuration: 5 * 60 * 1000,
}));

const routes = require('./api/routes');
routes(app);

app.listen(argv.port);

function validate_argv() {
  const argv = require('minimist')(process.argv.slice(2));
  switch(argv.log) {
    case 'ERROR':
    case 'WARN':
    case 'INFO':
    case 'DEBUG':
      process.argv.log = argv.log;
      break;
    default:
      process.argv.log='ERROR';
  }

  process.argv.port = isNaN(argv.port) ? 8080 : argv.port;
  process.argv.mail = !argv.mail ? 'localhost' : argv.mail;
  process.argv.mongo = !argv.mongo ? 'localhost' : argv.mongo;

  return process.argv;
}
