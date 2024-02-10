'use strict';

import logger from '../logger.js';

/**
 * LOGGEDIN
 * Returns true if the user is logged in
 */
export default function(req, res) {
  logger.DEBUG('[LOGGEDIN] received: ' + JSON.stringify(req.body));
  
  if (req.session && req.session.user) {
    logger.DEBUG('[LOGGEDIN] user logged in');
    res.json({status: 'OK', loggedin: true});
  } else {
    logger.DEBUG('[LOGGEDIN] user not logged in');
    res.json({status: 'OK', loggedin: false});
  }
};
