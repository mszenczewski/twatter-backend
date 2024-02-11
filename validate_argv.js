'use strict';

import minimist from "minimist";

export default function validate_argv() {
  const argv = minimist(process.argv.slice(2));

  switch(argv.log) {
    case 'error':
    case 'warn':
    case 'info':
    case 'debug':
      process.argv.log = argv.log;
      break;
    default:
      process.argv.log='error';
  }

  process.argv.port = isNaN(argv.port) ? 8080 : argv.port;
  process.argv.mail = !argv.mail ? 'localhost' : argv.mail;
  process.argv.mongo = !argv.mongo ? 'localhost' : argv.mongo;

  return process.argv;
}
