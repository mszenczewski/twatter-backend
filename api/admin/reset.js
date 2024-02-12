'use strict';

import Item from '../models/item.js';
import Media from '../models/media.js';
import User from '../models/user.js';
import logger_child from '../logger.js';

const logger = logger_child('reset');

/**
 * RESET
 * Resets the database
 */
export default async function(req, res) {
  try {
    await Item.deleteMany({});
    await User.deleteMany({});
    await Media.deleteMany({});
    logger.info('database reset');
    res.json({status: 'OK'});
  } catch (err) {
    logger.error(err);
    res.json({status: 'error', error: 'fatal'});
  }
};