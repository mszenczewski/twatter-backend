'use strict';

import Item from '../models/item.js';
import logger_child from '../logger.js';

const logger = logger_child('removeallitems');

/**
 * REMOVE ALL ITEMS 
 * Removes all 'tweets' from database
 */
export default async function(req, res) {
  try {
    await Item.deleteMany({});
    logger.info('all items removed');
    res.json({status: 'OK'});
  } catch (err) {
    logger.error(err);
    res.json({status: 'error'});
  }
};
