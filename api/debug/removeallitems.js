'use strict';

import Item from '../models/item.js';
import logger from '../logger.js';

/**
 * REMOVE ALL ITEMS 
 * Removes all 'tweets' from database
 */
export default async function(req, res) {
  try {
    await Item.deleteMany({});
    logger.INFO('[REMOVEALLITEMS] all items removed');
    res.json({status: 'OK'});
  } catch (err) {
    logger.ERROR('[REMOVEALLITEMS] ' + err);
    res.json({status: 'error'});
  }
};
