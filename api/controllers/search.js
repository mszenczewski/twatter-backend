'use strict';

import Item from '../models/item.js';
import User from '../models/user.js';
import logger_child from '../logger.js';

const logger = logger_child('search');

/**
 * SEARCH
 * Searches the database for 'tweets'
 * JSON: {timestamp:, limit:, q:, username:, following:}
 */
export default async function(req, res) {
  logger.debug('received: ' + JSON.stringify(req.body, null, 2));

  const options = {};

  //TIMESTAMP
  if (!req.body.timestamp) {
    let d = new Date();
    let t = d.getTime() / 1000;
    options.timestamp = { $lte: t };
  } else {
    options.timestamp = { $lte: req.body.timestamp };
  }

  //LIMIT
  let limit = 25;
  if (req.body.limit !== null && !isNaN(parseInt(req.body.limit))) {
    limit = req.body.limit;
  }
  if (limit > 100) {
    limit = 100;
  }

  //QUERY
  if (req.body.q) {
    options.$text = {$search: req.body.q};
  }

  //USERNAME
  if (req.body.username) {
    options.username = req.body.username;
  }

  //PARENT
  if (req.body.parent) {
    options.parent = req.body.parent;
  }

  //HASMEDIA
  if (req.body.hasMedia === true) {
    options.media = {$exists: true, $not: {$size: 0}};
  }

  //REPLIES
  if (req.body.replies === false) {
    options.childType = {$ne: 'reply'};
  }

  //FOLLOWING
  if (req.body.following === true) {
    if (!req.session || !req.session.user) {
        logger.warn('user not logged in');
        res.json({status: 'error', error: 'user not logged in'});
        return;
    }

    try {
      const user = await User.findOne({username: req.session.user}, {following : 1});

      if (req.body.username && user.following.indexOf(req.body.username) === -1) {
        logger.warn('searched for user not in following list');
        res.json({status: 'OK', items: []});
        return;
      }

      if (!req.body.username) {
        options.username = { $in: user.following };
      }
    } catch (err) {
      logger.error(err);
      res.status(500).json({status: 'error', error: 'fatal'});
    }
  }

  //SEARCH
  try {
    logger.debug('options: ' + JSON.stringify(options, null, 2));

    let results = await Item.find(options).limit(parseInt(limit));

    //SORTING
    switch(req.body.rank) {
      case 'time':
        results.sort((a, b) => b.timestamp - a.timestamp);
        break;
      case 'interest':
      default:
        results.sort((a, b) => (b.property.likes + b.retweeted) - (a.property.likes + a.retweeted));
    }

    let json = {status: 'OK', items: results};

    logger.info(`${json.items.length} results sent`);

    res.send(json);
  } catch (err) {
    logger.error(err);
    res.status(500).json({status: 'error', error: 'fatal'});
  }
};