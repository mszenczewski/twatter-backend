'use strict';

import Item from '../models/item.js';
import logger_child from '../logger.js';

const logger = logger_child('listallitems');

/**
 * LIST ALL ITEMS 
 * Returns all 'tweets' in the database
 */
export default async function(req, res) {
  try {
    logger.debug('listing all items');
    const results = await Item.find({});
    res.json(results);
  } catch (err) {
    logger.error(err);
    res.json({status: 'error'});
  }
};
