'use strict';

import Item from '../models/item.js';
import Media from '../models/media.js';
import User from '../models/user.js';
import logger from '../logger.js';

/**
 * RESET 
 * Resets the database
 */
export default async function(req, res) {
  try {
    await Item.deleteMany({});
    await User.deleteMany({});
    await Media.deleteMany({});
    logger.INFO('[RESET] database reset');
    res.json({status: 'OK'});
  } catch (err) {
    logger.ERROR('[RESET]: ' + err);
    res.json({status: 'error', error: 'fatal'});
  }
};