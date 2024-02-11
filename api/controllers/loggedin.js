'use strict';

import logger_child from '../logger.js';

const logger = logger_child('loggedin');

/**
 * LOGGEDIN
 * Returns true if the user is logged in
 */
export default function(req, res) {
  logger.debug('received: ' + JSON.stringify(req.body));
  
  if (req.session && req.session.user) {
    logger.debug('user logged in');
    res.json({status: 'OK', loggedin: true});
  } else {
    logger.debug('user not logged in');
    res.json({status: 'OK', loggedin: false});
  }
};
