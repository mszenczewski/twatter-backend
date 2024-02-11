'use strict';

import User from '../models/user.js';
import logger_child from '../logger.js';

const logger = logger_child('listallusers');

/**
 * LIST ALL USERS 
 * Returns all users in the database
 */
export default async function(req, res) {
  try {
    logger.debug('getting all users');
    const results = await User.find({});
    res.json(results);
  } catch (err) {
    logger.error(err);
    res.json({status: 'error'});
  }
};
