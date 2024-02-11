'use strict';

import express from 'express';
import mongoose from 'mongoose';
import session from 'client-sessions';
import bodyParser from 'body-parser';
import router from './api/routes.js';
import validate_argv from './validate_argv.js';

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