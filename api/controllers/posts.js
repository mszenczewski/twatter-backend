'use strict';

import Item from '../models/item.js';
import logger from '../logger.js';

/**
 * POSTS
 * Retrieves posts based on username
 */
export default async function(req, res) {
  logger.debug('[POSTS] received: ' + JSON.stringify(req.params, null, 2));
  logger.debug('[POSTS] received: ' + JSON.stringify(req.query, null, 2));

  //LIMIT
  let limit = 50;
  if (req.query.limit !== null && !isNaN(parseInt(req.query.limit))) {
    limit = req.query.limit;
  }
  if (limit > 200) {
    limit = 200;
  }

  try {
    const results = await Item.find({'username': req.params.username}, {id : 1}).limit(parseInt(limit));
    const items = results.map(item => item.id);

    logger.info('[POSTS] ' + items.length + ' results sent');
    logger.debug('[POSTS] ' + JSON.stringify(items, null, 2));

    res.send({status: 'OK', items: items});
  } catch (err) {
    logger.error('[POSTS] ' + err); 
    res.status(500).json({status: 'error', error: 'fatal'});
  }
};
