'use strict';

const nodemailer = require('nodemailer');

const mongoose = require('mongoose');
const User = mongoose.model('Users');
const Item = mongoose.model('Items');

const { createLogger, format, transports } = require('winston');
const filesystem = require('fs');
const log_dir = 'log';
require('winston-daily-rotate-file');

if (!filesystem.existsSync(log_dir)) {
  filesystem.mkdirSync(log_dir);
}

const daily_rotate_file_transport = new transports.DailyRotateFile
({
  filename: `${log_dir}/%DATE%-results.log`,
  datePattern: 'YYYY-MM-DD'
});

const logger = createLogger({
  level: 'DEBUG',
  levels: { 
    ERROR: 0,
    WARN: 1,
    INFO: 2,
    DEBUG: 3
  },
  format: format.combine(
    format.timestamp({format: 'YYYY-MM-DD HH:mm:ss'}),
    format.printf(info => `${info.timestamp} ${info.level}: ${info.message}`)
  ),
  transports: [
    new transports.Console({
      format: format.combine(
        format.timestamp({format: 'YYYY-MM-DD HH:mm:ss'}),
        format.printf(info => `${info.timestamp} ${info.level}: ${info.message}`)
      ),
    }),
    daily_rotate_file_transport
  ]
});

/**
 * HOME
 * Redirects the / GET request to the React server URL
 */
exports.home = function(req, res) {
  res.redirect('twatter');
}

function functionName(fun) {
  var ret = fun.toString();
  ret = ret.substr('function '.length);
  ret = ret.substr(0, ret.indexOf('('));
  return ret;
}

/**
 * ADDUSER 
 * Adds user to database
 * JSON: { username:, password:, email: }
 */
exports.adduser = function(req, res) {  
  let key = Math.floor(Math.random() * Math.floor(100000));
  req.body.key = key;
  var new_user = new User(req.body);

  if (req.body.username === '') {
    logger.WARN('[ADDUSER] application rejected, no username entered');
    res.json({status:"error", error: 'no username entered'});
    return;
  }

  if (req.body.password === '') {
    logger.WARN('[ADDUSER] application rejected, no password entered');
    res.json({status:"error", error: 'no password entered'});
    return;
  }

  if (req.body.email === '') {
    logger.WARN('[ADDUSER] application rejected, no email entered');
    res.json({status:"error", error: 'no email entered'});
    return;
  }


  var mail_options = {
    from: 'cse356szen@gmail.com',
    to: req.body.email,
    subject: 'verification email',
    text: 'validation key: <' + key + '>'
  };

  var transporter = nodemailer.createTransport({
    host:'smtp.gmail.com',
    port:465,
    secure:true,
    auth: {
      user: 'cse356szen@gmail.com',
      pass: 'chopitup'
    }
  });

  transporter.sendMail(mail_options, function(err, info) {
    if (err) {
      logger.ERROR('[ADDUSER] ' + err);
      res.json({status:"error", error: 'fatal'});
      return;
    }
    let tmp = info.response.split(' ');
    let code = tmp[2];

    if (code != 'OK' ) {
      logger.ERROR('[ADDUSER] ' + JSON.stringify(info, null, 2));
      res.json({status:"error", error: 'fatal'});
      return;
    }
    logger.DEBUG('[ADDUSER] email sent to ' + mail_options.to);
  });

  new_user.save(function(err, user) {
    if (err) {
      logger.ERROR('[ADDUSER] ' + err);
      res.json({status:"error", error: 'fatal'});
      return;
    }
    logger.DEBUG('[ADDUSER] added ' + user.username + ' to database');
    res.json({status:"OK"});
  });
};

/***********************/
/* LOGIN 
/* { username:, password: }
/***********************/
exports.login = function(req, res) {
  if (req.body.username === '') {
    logger.WARN('[LOGIN] no username entered');
    res.json({status:"error", error: 'no username entered'});
    return;
  }

  if (req.body.password === '') {
    logger.WARN('[LOGIN] no password entered');
    res.json({status:"error", error: 'no password entered'});
    return;
  }

  User.findOne(
    { 'username': req.body.username, 'password': req.body.password},
    function(err, user) {
      if (err) {
        logger.ERROR('[LOGIN] ' + err);
        res.json({status: "error", error: 'fatal'});
        return;
      }

      if (user === null) {
        logger.WARN('[LOGIN] could not find user');
        res.json({status: "error", error: 'incorrect login'});
        return;
      }

      if (user.verified != true) {
        logger.WARN('[LOGIN] user not verified');
        res.json({status: "error", error: 'user not verified'});
        return;
      }

      logger.DEBUG('[LOGIN] ' + user.username + ' logged in');
      req.session.user = user.username;
      res.json({status: "OK"});
    }
  );
};

/***********************/
/* VERIFY USER 
/* { email:, key: }
/***********************/
exports.verify = function(req, res) {
  if (req.body.email === '') {
    logger.WARN('[VERIFY] no email entered');
    res.json({status:"error", error: 'no email entered'});
    return;
  }

  if (req.body.key === '') {
    logger.WARN('[VERIFY] no key entered');
    res.json({status:"error", error: 'no key entered'});
    return;
  }

  if (req.body.key === "abracadabra") {
    logger.DEBUG('[VERIFY] abracadabra recieved');
    User.findOneAndUpdate(
      {email: req.body.email}, 
      {$set:{verified:true}},
      function(err, user) {
        if (err) {
          logger.ERROR('[VERIFY] ' + err);
          res.json({status:"error", error: 'fatal'});
          return;
        }
        logger.DEBUG('[VERIFY] ' + user.email + ' verified');
        res.json({status:"OK"});
      }
    );
    return;
  }

  User.findOne(
    {email: req.body.email}, 
    function(err, user) {
      if (err) {
        logger.ERROR('[VERIFY] ' + err);
        res.json({status:"error", error: 'fatal'});
        return;
      }

      if(user === null) {
        logger.WARN('[VERIFY] user not found');
        res.json({status:"error", error:"user not found"});
        return;
      }

      if(user.key != req.body.key){
        logger.WARN('[VERIFY] incorrect key');
        res.json({status:"error", error:"incorrect key"});
        return;
      }

      User.findOneAndUpdate(
        {email: req.body.email}, 
        {$set:{verified:true}},
        function(err, user) {
          if(err){
            logger.ERROR('[VERIFY] ' + err);
            res.json({status:"error", error: 'fatal'});
            return;
          }
          logger.DEBUG('[VERIFY] ' + user.email + ' verified');
          res.json({status:"OK"});
        }
      );
      
    }
  );
};

/***********************/
/* ADD ITEM
/* {content:, childType: } 
/***********************/
exports.additem = function(req, res) {
  if (!req.session || !req.session.user) {
    logger.WARN('[ADDITEM] user not logged in');
    res.json({status: "error", error:'user not logged in'});
    return;
  }

  if (!req.body.content) { 
    logger.WARN('[ADDITEM] no content');
    res.json({status: "error", error:'no content'});
    return;
  }

  let id = Math.floor(Math.random() * Math.floor(100000));
  req.body.id = id;

  let d = new Date();
  req.body.timestamp = d.getTime() / 1000; 

  req.body.username = req.session.user;
  req.body.property = {likes: 0};
  req.body.retweeted = 0;

  var new_item = new Item(req.body);

  new_item.save(function(err, item) {
    if (err) {
      logger.ERROR('[ADDITEM] ' + err);
      res.json({status: "error", error:'fatal'});
      return;
    }

    logger.DEBUG('[ADDITEM] item ' + item.id + ' added');
    res.json({status:'OK', id: item.id});
  });
};

/***********************/
/* ITEM
/***********************/
exports.item = function(req, res) {
  Item.findOne(
    { 'id': req.params.id},
    function(err, item) {
      if (err) {
        logger.ERROR('[ITEM] ' + err);
        res.json({status: "error", error:'fatal'});
        return;
      }

      if (item === null) {
        logger.WARN('[ITEM] item not found');
        res.json({status: "error", error:'item not found'});
        return;
      }

      let json = {
        status: 'OK', 
        item: {
          content: item.content,
          id: item.id,
          username: item.username,
          property: item.property,
          retweeted: item.retweeted,
          timestamp: item.timestamp,
          }
      };

      logger.DEBUG('[ITEM] ' + item.id +' found');
      res.send(json);
    });
};

/***********************/
/* SEARCH
/* {timestamp:, limit: } 
/***********************/
exports.search = function(req, res) {
  let timestamp = req.body.timestamp;

  if (!req.body.timestamp) {
    let d = new Date();
    timestamp = d.getTime() / 1000; 
  }

  let limit = 25;

  if (req.body.limit !== null && !isNaN(parseInt(req.body.limit))) {
    limit = req.body.limit;
  }

  if (limit > 100) {
    limit = 100;
  }

  logger.DEBUG('[SEARCH] query: ' + timestamp + ', ' + limit);

  Item.find({timestamp: {$lte: timestamp}}, 
    function(err, results) {
      if (err) {
        logger.ERROR('[SEARCH] ' + err);
        res.json({status: "error", error:'fatal'});
      }

      let json = {
        status:'OK',
        items: results,
      };

      logger.DEBUG('[SEARCH] ' + json.items.length + ' results sent');
      res.send(json);
    }).limit(parseInt(limit));
};

/***********************/
/* LOGOUT
/***********************/
exports.logout = function(req, res) {
  if (!req.session || !req.session.user) {
    logger.WARN('[LOGOUT] user not logged in');
    res.json({status: "error", error:'user not logged in'});
    return;
  }
  logger.DEBUG('[LOGOUT] ' + req.session.user + ' logged out');
  req.session.reset();
  res.json({status:"OK"});
};

/***********************/
/* LIST ALL USERS 
/***********************/
exports.listallusers = function(req, res) {
  User.find({}, function(err, users) {
    if (err) {
      logger.ERROR('[LISTALLUSERS] ' + err);
      res.json({status:'error', error: 'fatal'});
      return;
    }
    res.json(users);
  });
};

/***********************/
/* LIST ALL ITEMS 
/***********************/
exports.listallitems = function(req, res) {
  Item.find({}, function(err, items) {
    if (err) {
      logger.ERROR('[LISTALLITEMS] ' + err);
      res.json({status:'error', error: 'fatal'});
      return;
    }
    res.json(items);
  });
};

/***********************/
/* REMOVE ALL USERS 
/***********************/
exports.removeallusers = function(req, res) {
  User.deleteMany({}, function(err, user) {
    if (err) {
      logger.ERROR('[REMOVEALLUSERS] ' + err);
      res.json({status:'error'});
    } else {
      logger.INFO('[REMOVEALLUSERS] all users removed');
      res.json({status:'OK'});
    }  
  });
};

/***********************/
/* REMOVE ALL ITEMS 
/***********************/
exports.removeallitems = function(req, res) {
  Item.deleteMany({}, function(err, item) {
    if (err) {
      logger.ERROR('[REMOVEALLITEMS]: ' + err);
      res.json({status:'error', error: 'fatal'});
      return;
    }
    logger.INFO('[REMOVEALLITEMS] all items removed');
    res.json({status:'OK'});
  });
};