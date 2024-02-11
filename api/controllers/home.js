'use strict';

import logger_child from '../logger.js';

const logger = logger_child('home');

/**
 * HOME
 * Redirects the / GET request to the React server URL
 */
export default function(req, res) {
  logger.debug('received: ' + JSON.stringify(req.body));
  res.redirect('twatter');
}
