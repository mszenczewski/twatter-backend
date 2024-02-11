'use strict';

import config from 'config';

export default function get_config() {
  const cfg = {
    "port": config.get('port'),
    "log_level": config.get('log_level'),
    "mongodb": {
      "url": config.get('mongodb.url'),
      "port": config.get('mongodb.port'),
      "name": config.get('mongodb.name')
    },
    "postfix": {
      "url": config.get('postfix.url'),
      "port": config.get('postfix.port')
    }
  }

  validate_config(cfg);
  return cfg;
}

function validate_config(cfg) {
  cfg.port = valid_port(cfg.port, 8080);
  cfg.mongodb.port = valid_port(cfg.mongodb.port, 27017);
  cfg.postfix.port = valid_port(cfg.postfix.port, 2525);
  cfg.log_level = valid_level(cfg.log_level, 'debug');
  cfg.postfix.url = valid_url(cfg.postfix.url, 'localhost');
  cfg.mongodb.url = valid_url(cfg.mongodb.url, 'localhost');
}

function valid_port(port, safe) {
  if (isNaN(Number(port))) return safe;
  return port;
}

function valid_url(url, safe) {
  if (url === 'localhost') return url;

  const pieces = url.split('.');
  if (pieces.length !== 4) return safe;

  for (const i in pieces) {
    const n = Number(pieces[i]);
    if (isNaN(n) || n < 0 || n > 255) return safe;
  }

  return url;
}

function valid_level(level, safe) {
  switch(level) {
    case 'error':
    case 'warn':
    case 'info':
    case 'debug':
      return level;
    default:
      return safe;
  }
}