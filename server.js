'use strict';

import express from 'express';
import mongoose from 'mongoose';
import session from 'client-sessions';
import bodyParser from 'body-parser';
import router from './api/router.js';
import get_config from './get_config.js';

const cfg = get_config();

const mongo_url = `${cfg.mongodb.url}:${cfg.mongodb.port}/${cfg.mongodb.name}`;
const postfix_url = `${cfg.postfix.url}:${cfg.postfix.port}`;

console.log(`[args] logging in ${cfg.log_level} mode`);
console.log(`[args] listening on port ${cfg.port}`);
console.log(`[args] using ${mongo_url} as mongodb server`);
console.log(`[args] using ${postfix_url} as postfix server`);

mongoose.Promise = global.Promise;
mongoose.connect(`mongodb://${mongo_url}`).then();

const app = express();

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(session({
  cookieName: 'session',
  secret: 'ax86nsob7jeu48gks',
  duration: 30 * 60 * 1000,
  activeDuration: 5 * 60 * 1000,
}));

router(app);
app.listen(cfg.port);

export default app;