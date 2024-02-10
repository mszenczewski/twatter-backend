'use strict';

import Item from '../models/item.js';
import logger from '../logger.js';

/**
 * LIST ALL ITEMS 
 * Returns all 'tweets' in the database
 */
export default async function(req, res) {
  try {
    const results = await Item.find({});
    res.json(results);
  } catch (err) {
    logger.ERROR('[LISTALLITEMS] ' + err);
    res.json({status: 'error'});
  }
};
