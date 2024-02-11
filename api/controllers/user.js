'use strict';

import User from '../models/user.js';
import logger from '../logger.js';

/**
 * USER
 * Retrieves user based on username
 */
export default async function(req, res) {
  logger.debug('[USER] received: ' + JSON.stringify(req.params));

  try {
    const u = await User.findOne({'username': req.params.username}, {username : 1, email : 1, followers : 1, following : 1});

    if (u === null) {
      logger.warn('[USER] user not found');
      res.status(404).json({status: 'error', error: 'user not found'});
      return;
    }

    const json = {
      status: 'OK',
      user: {
        email: u.email,
        followers: u.followers.length,
        following: u.following.length
      }
    }

    logger.info('[FOLLOWING] ' + u.username + ' info sent');
    logger.debug('[FOLLOWING] ' + JSON.stringify(json, null, 2));

    res.send(json);

  } catch (err) {
    logger.error('[USER] ' + err);
    res.status(500).json({status: 'error', error: 'fatal'}); 
  }
};
