'use strict';

import User from '../models/user.js';
import logger from '../logger.js';

/**
 * FOLLOWERS
 * Retrieves followers based on username
 */
export default async function(req, res) {
  logger.debug('[FOLLOWERS] received: ' + JSON.stringify(req.params, null, 2));
  logger.debug('[FOLLOWERS] received: ' + JSON.stringify(req.query, null, 2));

  //LIMIT
  let limit = 50;
  if (req.query.limit !== null && !isNaN(parseInt(req.query.limit))) {
    limit = req.query.limit;
  }
  if (limit > 200) {
    limit = 200;
  }

  try {
    const user = await User.findOne({'username': req.params.username}, {followers : 1}).limit(parseInt(limit));

    if (user === null) {
      logger.error('[FOLLOWERS] ' + err);
      res.status(404).json({status: 'error', error: 'user does not exist'}); 
      return;
    }

    let json = {status: 'OK', users: user.followers};

    logger.info('[FOLLOWERS] ' + json.users.length + ' results sent');
    logger.debug('[FOLLOWERS] ' + JSON.stringify(json, null, 2));

    res.status(200).send(json);

  } catch (err) {
    logger.error('[FOLLOWERS] ' + err);
    res.status(500).json({status: 'error', error: 'fatal'});
  }
};
