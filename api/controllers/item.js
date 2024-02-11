'use strict';

import Item from '../models/item.js';
import logger from '../logger.js';

/**
 * ITEM
 * Retrieves and item based on ID
 */
export default async function(req, res) {
  logger.debug('[ITEM] received: ' + JSON.stringify(req.params));

  try {
    const item = await Item.findOne({'id': req.params.id});

    if (item === null) {
      logger.warn('[ITEM] item not found');
      res.status(404).json({status: 'error', error: 'item not found'});
      return;
    }

    const json = {
      status: 'OK', 
      item: {
        content: item.content,
        id: item.id,
        username: item.username,
        property: item.property,
        retweeted: item.retweeted,
        timestamp: item.timestamp,
        parent: item.parent,
        media: item.media
        }
    };

    logger.info('[ITEM] ' + item.id + ' found');
    res.status(200).send(json);

  } catch (err) {
    logger.error('[ITEM] ' + err);
    res.status(500).json({status: 'error', error: 'fatal'});
  }
};
