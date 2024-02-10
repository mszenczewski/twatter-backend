'use strict';

import User from '../models/user.js';
import logger from '../logger.js';

/**
 * LIST ALL USERS 
 * Returns all users in the database
 */
export default async function(req, res) {
  try {
    const results = await User.find({});
    res.json(results);
  } catch (err) {
    logger.ERROR('[LISTALLUSERS] ' + err);
    res.json({status: 'error'});
  }
};
