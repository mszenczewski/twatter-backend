'use strict';

import config from 'config';

export default function get_config() {
  const port = config.get('port');
  const log_level = config.get('log_level');
  const mongo_url = config.get('mongodb.url');
  const mongo_port = config.get('mongodb.port');
  const mongo_name = config.get('mongodb.name');
  const postfix_url = config.get('postfix.url');
  const postfix_port = config.get('postfix.port');

  const cfg = {
    "port": port,
    "log_level": log_level,
    "mongodb": {
      "url": mongo_url,
      "port": mongo_port,
      "name": mongo_name
    },
    "postfix": {
      "url": postfix_url,
      "port": postfix_port
    }
  }

  validate_config(cfg);

  return cfg;
}

function validate_config(cfg) {
  cfg.port = valid_port(cfg.port, 8080);
  cfg.mongodb.port = valid_port(cfg.mongodb.port, 27017);
  cfg.postfix.port = valid_port(cfg.postfix.port, 2525);
  cfg.log_level = valid_level(cfg.log_level, 'debug')
}

function valid_port(port, default_port) {
  if (isNaN(Number(port))) return default_port;
  return port;
}

function valid_level(level, default_level) {
  switch(level) {
    case 'error':
    case 'warn':
    case 'info':
    case 'debug':
      return level;
    default:
      return default_level;
  }
}