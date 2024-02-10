'use strict';

import Media from '../models/media.js';
import logger from '../logger.js';

/**
 * REMOVE ALL MEDIA 
 * Removes all media from database
 */
export default async function(req, res) {
  try {
    await Media.deleteMany({});
    logger.INFO('[REMOVEALLMEDIA] all media removed');
    res.json({status: 'OK'});
  } catch (err) {
    logger.ERROR('[REMOVEALLMEDIA] ' + err);
    res.json({status: 'error'});
  }
};
