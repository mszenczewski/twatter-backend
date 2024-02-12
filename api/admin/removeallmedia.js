'use strict';

import Media from '../models/media.js';
import logger_child from '../logger.js';

const logger = logger_child('removeallmedia');

/**
 * REMOVE ALL MEDIA
 * Removes all media from database
 */
export default async function(req, res) {
  try {
    await Media.deleteMany({});
    logger.info('all media removed');
    res.json({status: 'OK'});
  } catch (err) {
    logger.error(err);
    res.json({status: 'error'});
  }
};