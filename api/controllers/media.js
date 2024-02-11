'use strict';

import Media from '../models/media.js';
import logger_child from '../logger.js';

const logger = logger_child('media');

/**
 * MEDIA
 * Retrieves a media based on ID
 */
export default async function(req, res) {
  logger.debug('received: ' + JSON.stringify(req.params));

  try {
    const media = await Media.findOne({'id': req.params.id});

    if (media === null) {
      logger.warn('media not found');
      res.status(404).json({status: 'error', error: 'media not found'});
      return;
    }

    logger.info(`${media.id} found`);

    res.writeHead(200, {'Content-Type': media.content.contentType});        
    res.end(media.content.data);

  } catch (err) {
    logger.error(err);
    res.status(500).json({status: 'error', error: 'fatal'});
  }
};