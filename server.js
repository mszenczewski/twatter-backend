import express from 'express';
import mongoose from 'mongoose';
import session from 'client-sessions';
import bodyParser from 'body-parser';
import minimist from 'minimist';
import router from './api/routes.js';
import './api/models/item.js'
import './api/models/user.js'
import './api/models/media.js'

const argv = validate_argv();
const app = express();

console.log(`[args] logging in ${argv.log} mode`);
console.log(`[args] listening on port ${argv.port}`);
console.log(`[args] using ${argv.mail} as mail server`);
console.log(`[args] using ${argv.mongo} as mongo server`);

mongoose.Promise = global.Promise;

const mongo_url = `mongodb://${argv.mongo}:27017/twatterdb`;

mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);

mongoose.connect(mongo_url, {useNewUrlParser: true, useUnifiedTopology: true}).then();

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

app.use(session({
  cookieName: 'session',
  secret: 'ax86nsob7jeu48gks',
  duration: 30 * 60 * 1000,
  activeDuration: 5 * 60 * 1000,
}));

router(app);

app.listen(argv.port);

function validate_argv() {
  const argv = minimist(process.argv.slice(2));
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
