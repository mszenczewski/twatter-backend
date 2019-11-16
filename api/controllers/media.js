'use strict';

const logger = require('../logger');
const mongoose = require('mongoose'),
  Media = mongoose.model('Media');

/**
 * MEDIA
 * Retrieves a media based on ID
 */
module.exports = function(req, res) {
  logger.DEBUG('[MEDIA] received: ' + JSON.stringify(req.params));

  Media.findOne({'id': req.params.id}, function(err, media) {
    if (err) {
      logger.ERROR('[MEDIA] ' + err);
      res.status(500).json({status: 'error', error: 'fatal'});
      return;
    }

    if (media === null) {
      logger.WARN('[MEDIA] media not found');
      res.status(404).json({status: 'error', error: 'media not found'});
      return;
    }

    logger.INFO('[MEDIA] ' + media.id + ' found');

    res.writeHead(200, {'Content-Type': media.content.contentType});        
    res.end(media.content.data);
  });
};
