'use strict';

import Item from '../models/item.js';
import Media from '../models/media.js';
import logger_child from '../logger.js';

const logger = logger_child('additem');

/**
 * ADD ITEM
 * Adds a 'tweet' to the database
 * JSON: {content: childType: parent: media:} 
 */
export default async function(req, res) {
  logger.debug('received: ' + JSON.stringify(req.body, null, 2));

  if (!req.session || !req.session.user) {
    logger.warn('user not logged in');
    res.status(403).json({status: 'error', error: 'user not logged in'});
    return;
  }

  if (!req.body.content) { 
    logger.warn('no content');
    res.status(400).json({status: 'error', error: 'no content'});
    return;
  }

  if (req.body.childType === 'retweet') {
    try {
      await Item.findOneAndUpdate({id: req.body.parent}, {$inc: {'retweeted': 1}});
      logger.info(`${req.body.parent} retweeted by ${req.session.user}`);
      res.status(200).json({status: 'OK'});
      return;
    } catch (err) {
      logger.error(err);
      res.status(500).json({status: 'error', error: 'fatal'});
      return;
    }
  }

  if (req.body.media) {
    try {
      const results = await Media.find({id: req.body.media}, {by : 1, id : 1});
      logger.debug('req.session.user: ' + req.session.user);
      logger.debug('results: ' + JSON.stringify(results,null,2));

      for (let i = 0; i < results.length; i++) {
        if (results[i].by.tweetid !== null) {
          logger.warn('media already has a tweet associated with it');
          res.status(403).json({status: 'error', error: 'media already has a tweet associated with it'});
          return;
        } 
        if (results[i].by.username !== req.session.user) {
          logger.warn('media does not belong to user');
          res.status(403).json({status: 'error', error: 'media does not belong to user'});
          return;
        } 
      }
    } catch (err) {
      logger.error(err);
      res.status(500).json({status: 'error', error: 'fatal'});
      return;
    }
  } 

  const temp = {
    id: Math.floor(Math.random() * Math.floor(100000000000000000)),
    username: req.session.user,
    property: {likes: 0},
    retweeted: 0,
    content: req.body.content,
    timestamp: Date.now() / 1000,
    childType: req.body.childType
  };

  if (req.body.parent) {
    temp.parent = req.body.parent;
  }

  if (req.body.media) {
    temp.media = req.body.media;
  }

  try {
    const item = await Item.create(temp);
    
    if (req.body.media) {
      for (let i = 0; i < req.body.media.length; i++) {
        await Media.findOneAndUpdate({id: req.body.media[i]}, {'by.tweetid': item.id});
      }
    }

    res.status(200).json({status: 'OK', id: temp.id}); 
    logger.info(`item ${item.id} added`);
  } catch (err) {
    logger.error(err);
    res.status(500).json({status: 'error', error: 'fatal'});
  }
};
