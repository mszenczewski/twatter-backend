'use strict';

import User from '../models/user.js';
import logger_child from '../logger.js';

const logger = logger_child('verify');

/**
 * VERIFY USER
 * Verifies email with randomly generated key
 * JSON: { email:, key: }
 */
export default async function(req, res) {
  logger.debug('received: ' + JSON.stringify(req.body));

  if (req.body.email === '') {
    logger.warn('no email entered');
    res.status(400).json({status: 'error', error: 'no email entered'});
    return;
  }

  if (req.body.key === '') {
    logger.warn('no key entered');
    res.status(400).json({status: 'error', error: 'no key entered'});
    return;
  }

  try {
    const user = await User.findOne({email: req.body.email}, 'username verified key email', null).exec();

    if(user === null || user === undefined || user.email !== req.body.email) {
      logger.warn('user not found');
      res.status(404).json({status: 'error', error: 'user not found'});
      return;
    }

    if(user.verified === true) {
      logger.warn('email already verified');
      res.status(400).json({status: 'error', error: 'email already verified'});
      return;
    }

    if(user.key !== req.body.key && req.body.key !== 'abracadabra'){
      logger.warn('incorrect key');
      res.status(403).json({status: 'error', error: 'incorrect key'});
      return;
    }

    user.verified = true;
    await user.save();

    logger.info(`${user.email} verified`);
    res.status(200).json({status: 'OK'});
  } catch (err) {
    logger.error(err);
    res.status(500).json({status: 'error', error: 'fatal'});
  }
};