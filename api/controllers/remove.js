'use strict';

import Item from '../models/item.js';
import Media from '../models/media.js';
import logger_child from '../logger.js';

const logger = logger_child('remove');

/**
 * REMOVE
 * Removes a 'tweet' from database
 */
export default async function(req, res) {
  logger.debug('received: ' + JSON.stringify(req.params));

  if (!req.session || !req.session.user) {
    logger.warn('user not logged in');
    res.status(403).json({status: 'error', error: 'user not logged in'});
    return;
  }

  try {
    const item = await Item.findOne({'id': req.params.id}, {username : 1, media : 1});

    if (item === null) {
      logger.error('item not found');
      res.status(404).json({status: 'error', error: 'item not found'});
      return;
    }

    if (item.username !== req.session.user) {
      logger.warn('user not authorized to delete this item');
      res.status(403).json({status: 'error', error: 'user not authorized to delete this item'});
      return;
    }

    if (item.username !== req.session.user) {
      logger.warn('user not authorized to delete this item');
      res.status(403).json({status: 'error', error: 'user not authorized to delete this item'});
      return;
    }

    if (item.media) {
      await Media.deleteMany({id: {$in: item.media}});
      logger.info(`media ${item.media} removed`);
    }

    await Item.deleteOne({id: req.params.id});

    logger.info(`${req.params.id} removed`);
    res.status(200).json({status: 'OK'});

  } catch (err) {
    logger.error(err);
    res.status(500).json({status: 'error', error: 'fatal'});
  }
};
