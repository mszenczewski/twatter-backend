'use strict';

import logger from '../logger.js';

/**
 * HOME
 * Redirects the / GET request to the React server URL
 */
export default function(req, res) {
  logger.debug('[HOME] received: ' + JSON.stringify(req.body));
  res.redirect('twatter');
}
