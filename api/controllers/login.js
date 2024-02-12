'use strict';

import User from '../models/user.js';
import logger_child from '../logger.js';

const logger = logger_child('login');

/**
 * LOGIN
 * Logs user in
 * JSON: { username:, password: }
 */
export default async function(req, res) {
  logger.debug('received: ' + JSON.stringify(req.body));

  if (req.body.username === '') {
    logger.warn('no username entered');
    res.status(400).json({status: 'error', error: 'no username entered'});
    return;
  }

  if (req.body.password === '') {
    logger.warn('no password entered');
    res.status(400).json({status: 'error', error: 'no password entered'});
    return;
  }

  try {
    const user = await User.findOne({'username': req.body.username, 'password': req.body.password}, {username : 1, verified : 1});

    if (user === null) {
      logger.warn('incorrect login attempt');
      res.status(403).json({status: 'error', error: 'incorrect login'});
      return;
    }

    if (user.verified !== true) {
      logger.warn('user not verified');
      res.status(403).json({status: 'error', error: 'user not verified'});
      return;
    }

    logger.info(user.username + ' logged in');
    req.session.user = user.username;
    res.json({status: 'OK'});
  } catch (err) {
    logger.error(err);
    res.status(500).json({status: 'error', error: 'fatal'});
  }
};