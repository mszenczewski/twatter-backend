'use strict';

import logger_child from '../logger.js';

const logger = logger_child('logout');

/**
 * LOGOUT
 * Logs user out
 */
export default function(req, res) {
  logger.debug('received: ' + JSON.stringify(req.body));

  if (!req.session || !req.session.user) {
    logger.warn('user not logged in');
    res.json({status: 'error', error: 'user not logged in'});
    return;
  }
  logger.info(`${req.session.user} logged out`);
  req.session.reset();
  res.json({status: 'OK'});
};
