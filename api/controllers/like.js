'use strict';

import Item from '../models/item.js';
import User from '../models/user.js';
import logger_child from '../logger.js';

const logger = logger_child('like');

/**
 * LIKE
 * Like an item based on ID
 */
export default async function(req, res) {
  logger.debug('received: ' + JSON.stringify(req.params) + ' ' + JSON.stringify(req.body));

  if (!req.session || !req.session.user) {
    logger.warn('user not logged in');
    res.status(403).json({status: 'error', error: 'user not logged in'});
    return;
  }

  if (req.body.like) {
    var item_update = {$inc: {'property.likes': 1}};
    var user_update = {$addToSet: {liked: req.params.id}};
  } else {
    var item_update = {$inc: {'property.likes': -1}};
    var user_update = {$pull: {liked: req.params.id}};
  }

  try {
    const user = await User.findOne({username: req.session.user}, {username : 1, liked : 1});

    if (req.body.like && user.liked.includes(req.params.id)) {
      logger.warn(`${req.session.user} has already liked this item`);
      res.status(400).json({status: 'error', error: 'you have already liked this item'});
      return;
    }

    if (!req.body.like && !user.liked.includes(req.params.id)) {
      logger.warn(`${req.session.user} has not liked this item`);
      res.status(400).json({status: 'error', error: 'you have not liked this item'});
      return;
    }

    const item = await Item.findOneAndUpdate({id: req.params.id}, item_update);

    if (item === null) {
      logger.warn('item not found');
      res.status(404).json({status: 'error', error: 'item not found'});
      return;
    }

    await User.findOneAndUpdate({username: req.session.user}, user_update);

    if (req.body.like) var msg = 'liked';
    if (!req.body.like) var msg = 'unliked';
    logger.info(`${user.username} ${msg} ${item.id}`);

    res.status(200).json({status: 'OK'});
  } catch (err) {
    logger.error(err);
    res.status(500).json({status: 'error', error: 'fatal'});
  }
};