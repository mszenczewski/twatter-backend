'use strict';

import Media from '../models/media.js';
import logger from '../logger.js';

/**
 * LIST ALL MEDIA 
 * Returns all media in the database
 */
export default async function(req, res) {
  try {
    const results = await Media.find({});

    for (let i = 0; i < results.length; i++) {
      results[i].content.data = null;
    }

    res.json(results);
  } catch (err) {
    logger.error('[LISTALLMEDIA] ' + err);
    res.json({status: 'error', error: 'fatal'});
  }
};
