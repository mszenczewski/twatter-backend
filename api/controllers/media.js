'use strict';

import Media from '../models/media.js';
import logger from '../logger.js';

/**
 * MEDIA
 * Retrieves a media based on ID
 */
export default async function(req, res) {
  logger.DEBUG('[MEDIA] received: ' + JSON.stringify(req.params));

  try {
    const media = await Media.findOne({'id': req.params.id});

    if (media === null) {
      logger.WARN('[MEDIA] media not found');
      res.status(404).json({status: 'error', error: 'media not found'});
      return;
    }

    logger.INFO('[MEDIA] ' + media.id + ' found');

    res.writeHead(200, {'Content-Type': media.content.contentType});        
    res.end(media.content.data);

  } catch (err) {
    logger.ERROR('[MEDIA] ' + err);
    res.status(500).json({status: 'error', error: 'fatal'});
  }
};