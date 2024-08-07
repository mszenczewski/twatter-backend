'use strict';

import nodemailer from 'nodemailer';
import User from '../models/user.js';
import get_config from "../../get_config.js";
import logger_child from '../logger.js';

const cfg = get_config();
const logger = logger_child('adduser');

/**
 * ADDUSER
 * Adds user to database
 * JSON: { username:, password:, email: }
 */
export default async function(req, res) {
  logger.debug('received: ' + JSON.stringify(req.body));

  if (req.body.username === '') {
    logger.warn('application rejected, no username entered');
    res.status(400).json({status: 'error', error: 'no username entered'});
    return;
  }

  if (req.body.password === '') {
    logger.warn('application rejected, no password entered');
    res.status(400).json({status: 'error', error: 'no password entered'});
    return;
  }

  if (req.body.email === '') {
    logger.warn('application rejected, no email entered');
    res.status(400).json({status: 'error', error: 'no email entered'});
    return;
  }

  const random_key = Math.floor(Math.random() * Math.floor(100000000000000000));

  try {
    const u = await User.findOne({'username': req.body.username}, {username : 1}, null).exec();

    if (u !== null) {
      logger.warn('user already exists');
      res.status(400).json({status: 'error', error: 'user already exists'});
      return;
    }

    const user = new User({
      username: req.body.username,
      email: req.body.email,
      password: req.body.password,
      key: random_key
    });

    await user.save();

    logger.info(`added ${req.body.username} to database`);
    logger.debug('user: ' + JSON.stringify(user, null, 2));

    res.status(200).json({status: 'OK'});

    if (process.env.NODE_ENV !== 'test') {
      send_email(req.body.email, random_key).then();
    }
  } catch (err) {
    logger.error(err);
  }
};

async function send_email(email, random_key) {
  try {
    const mail_options = {
      from: 'no-reply@example.com',
      to: email,
      subject: 'verification email',
      text: 'validation key: <' + random_key + '>'
    };

    const transporter = nodemailer.createTransport({
      host: cfg.postfix.url,
      port: cfg.postfix.port,
      secure: false,
      tls: {
        rejectUnauthorized: false
      }
    });

    const info = await transporter.sendMail(mail_options);

    const tmp = info.response.split(' ');
    const code = tmp[0];

    if (code.charAt(0) !== 2) {
      logger.error(JSON.stringify(info, null, 2));
    } else {
      logger.info('email sent to ' + mail_options.to);
    }
  } catch (err) {
    logger.error(err);
  }
}