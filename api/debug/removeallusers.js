'use strict';

import User from '../models/user.js';
import logger from '../logger.js';

/**
 * REMOVE ALL USERS 
 * Removes all users from database
 */
export default async function(req, res) {
  try {
    await User.deleteMany({});
    logger.INFO('[REMOVEALLUSERS] all users removed');
    res.json({status: 'OK'});
  } catch (err) {
    logger.ERROR('[REMOVEALLUSERS] ' + err);
    res.json({status: 'error'});
  }
};