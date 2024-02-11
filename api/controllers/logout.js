'use strict';

import logger from '../logger.js';

/**
 * LOGOUT
 * Logs user out
 */
export default function(req, res) {
  logger.debug('[LOGOUT] received: ' + JSON.stringify(req.body));

  if (!req.session || !req.session.user) {
    logger.warn('[LOGOUT] user not logged in');
    res.json({status: 'error', error: 'user not logged in'});
    return;
  }
  logger.info('[LOGOUT] ' + req.session.user + ' logged out');
  req.session.reset();
  res.json({status: 'OK'});
};
