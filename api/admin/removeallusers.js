'use strict';

import User from '../models/user.js';
import logger_child from '../logger.js';

const logger = logger_child('removeallusers');

/**
 * REMOVE ALL USERS
 * Removes all users from database
 */
export default async function(req, res) {
  try {
    await User.deleteMany({});
    logger.info('all users removed');
    res.json({status: 'OK'});
  } catch (err) {
    logger.error(err);
    res.json({status: 'error'});
  }
};