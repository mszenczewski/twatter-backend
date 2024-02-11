'use strict';

import User from '../models/user.js';
import logger from '../logger.js';

/**
 * FOLLOWING
 * Searches the database for users that are being followed
 */
export default async function(req, res) {
  logger.debug('[FOLLOWING] received: ' + JSON.stringify(req.params, null, 2));
  logger.debug('[FOLLOWING] received: ' + JSON.stringify(req.query, null, 2));

  //LIMIT
  let limit = 25;
  if (req.query.limit !== null && !isNaN(parseInt(req.query.limit))) {
    limit = req.query.limit;
  }
  if (limit > 100) {
    limit = 100;
  }

  try {
    const user = await User.findOne({username: req.params.username}, {following : 1}).limit(parseInt(limit));

    if (user === null) {
      logger.warn('[FOLLOWING] user not found');
      res.status(404).json({status: 'error', error: 'user not found'});
      return;
    }

    const json = {status: 'OK', users: user.following};

    logger.info('[FOLLOWING] ' + json.users.length + ' results sent');
    logger.debug('[FOLLOWING] ' + JSON.stringify(json, null, 2));

    res.status(200).send(json);
  } catch (err) {
    logger.error('[FOLLOWING] ' + err);
    res.status(500).json({status: 'error', error: 'fatal'});
  }
};
