'use strict';

import Media from '../models/media.js';
import logger_child from '../logger.js';

const logger = logger_child('listallmedia');

/**
 * LIST ALL MEDIA 
 * Returns all media in the database
 */
export default async function(req, res) {
  try {
    logger.debug('listing all media');

    const results = await Media.find({});

    for (let i = 0; i < results.length; i++) {
      results[i].content.data = null;
    }

    res.json(results);
  } catch (err) {
    logger.error(err);
    res.json({status: 'error', error: 'fatal'});
  }
};
