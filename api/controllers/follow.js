'use strict';

import User from '../models/user.js';
import logger_child from '../logger.js';

const logger = logger_child('follow');

/**
 * FOLLOW
 * Follows another user
 * JSON: {username:, follow: } 
 */
export default async function(req, res) {
  logger.debug('received: ' + JSON.stringify(req.body, null, 2));

  if (req.body.username === '') {
    logger.warn('request rejected, no username entered');
    res.status(400).json({status: 'error', error: 'no username entered'});
    return;
  }

  if (req.body.follow !== true && req.body.follow !== false) {
    logger.warn('request rejected, no follow entered');
    res.status(400).json({status: 'error', error: 'no follow entered'});
    return;
  }

  if (!req.session || !req.session.user) {
    logger.warn('user not logged in');
    res.status(403).json({status: 'error', error: 'user not logged in'});
    return;
  }

  try {
    const target = await User.findOne({'username': req.body.username}, {username : 1, followers : 1});

    if (target === null) {
      logger.warn('could not find user');
      res.status(404).json({status: 'error', error: 'could not find user'});
      return;
    }

    if (req.body.follow && target.followers.indexOf(req.session.user) !== -1) {
      logger.warn('already follow user');
      res.status(400).json({status: 'error', error: 'already follow user'});
      return;
    }

    if (!req.body.follow && target.followers.indexOf(req.session.user) === -1) {
      logger.warn('not following user');
      res.status(400).json({status: 'error', error: 'not following user'});
      return;
    }

    const me = await User.findOne({'username': req.session.user}, {username : 1, following : 1});

    if (req.body.follow) {
      target.followers.push(req.session.user);
      await target.save();
      logger.info(`added ${req.session.user} to ${target.username}'s follower list`);

      me.following.push(target.username);
      await me.save();
      logger.info(`added ${target.username} to ${me.username}'s following list`);

      res.status(200).json({status: 'OK'});
    } else {
      target.followers.splice(target.followers.indexOf(req.session.user), 1);
      await target.save();
      logger.info(`removed ${req.session.user} from ${target.username}'s follower list`);

      me.following.splice(me.following.indexOf(target.username), 1);
      await me.save();
      logger.info(`removed ${target.username} from ${me.username}'s following list`);

      res.status(200).json({status: 'OK'});
    }
  } catch (err) {
    logger.error(err);
    res.status(500).json({status: 'error', error: 'fatal'});
  }
};
