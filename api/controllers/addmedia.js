'use strict';

import Media from '../models/media.js';
import formidable from 'formidable';
import fs from 'fs';
import logger_child from '../logger.js';

const logger = logger_child('addmedia');

/**
 * ADD MEDIA
 * Adds media to the database
 */
export default function(req, res) {
  if (!req.session || !req.session.user) {
    logger.warn('user not logged in');
    res.status(403).json({status: 'error', error: 'user not logged in'});
    return;
  }

  const form = new formidable.IncomingForm(); 
  form.parse(req, async function (err, fields, files) {
    if (err) {
      logger.error(err);
      return;
    }

    logger.debug('files: ' + JSON.stringify(files, null, 2));

    const media = new Media();

    media.id = Math.floor(Math.random() * Math.floor(100000000000000000));

    media.content = {
      contentType: files.content.type,
      data: fs.readFileSync(files.content.path)
    }
    
    media.by = {
      username: req.session.user,
      tweetid: null
    };

    res.status(200).json({status: 'OK', id: `${media.id}`});

    try {
      await media.save();
      fs.unlinkSync(files.content.path);
      logger.info(`media ${media.id} added`);
    } catch (err) {
      logger.error(err);
    }
  });
};
