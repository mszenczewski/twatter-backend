'use strict';

const nodemailer = require('nodemailer');

const mongoose = require('mongoose');
const User = mongoose.model('Users');
const Item = mongoose.model('Items');

const logger = require('./logger');

/**
 * HOME
 * Redirects the / GET request to the React server URL
 */
exports.home = function(req, res) {
  logger.DEBUG('[HOME] received: ' + JSON.stringify(req.body));
  res.redirect('twatter');
}

/**
 * LOGGEDIN
 * Returns true if the user is logged in
 */
exports.loggedin = function(req, res) {
  logger.DEBUG('[LOGGEDIN] received: ' + JSON.stringify(req.body));
  
  if (req.session && req.session.user) {
    logger.DEBUG('[LOGGEDIN] user logged in');
    res.json({status: 'OK', loggedin: true});
  } else {
    logger.DEBUG('[LOGGEDIN] user not logged in');
    res.json({status: 'OK', loggedin: false});
  }
}

/**
 * ADDUSER 
 * Adds user to database
 * JSON: { username:, password:, email: }
 */
exports.adduser = function(req, res) { 
  logger.DEBUG('[ADDUSER] received: ' + JSON.stringify(req.body));
 
  if (req.body.username === '') {
    logger.WARN('[ADDUSER] application rejected, no username entered');
    res.json({status: 'error', error: 'no username entered'});
    return;
  }

  if (req.body.password === '') {
    logger.WARN('[ADDUSER] application rejected, no password entered');
    res.json({status: 'error', error: 'no password entered'});
    return;
  }

  if (req.body.email === '') {
    logger.WARN('[ADDUSER] application rejected, no email entered');
    res.json({status: 'error', error: 'no email entered'});
    return;
  }

  const filter = {'username': req.body.username};
  const k = Math.floor(Math.random() * Math.floor(100000));

  const data = {
    username: req.body.username,
    email: req.body.email,
    password: req.body.password,
    key: k
  };

  User.findOneAndUpdate(filter, data, {upsert:true}, function(err, user) {
    if (err) {
      logger.ERROR('[ADDUSER] ' + err);
      res.json({status: 'error', error: 'fatal'});
      return;
    }

    if (user !== null) {
      logger.WARN('[ADDUSER] user already exists');
      res.json({status: 'error', error: 'user already exists'});
      return;
    }

    logger.INFO('[ADDUSER] added ' + req.body.username + ' to database');

    const mail_options = {
      from: 'cse356szen@gmail.com',
      to: req.body.email,
      subject: 'verification email',
      text: 'validation key: <' + k + '>'
    };
  
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: 'cse356szen@gmail.com',
        pass: 'chopitup'
      }
    });

    transporter.sendMail(mail_options, function(err, info) {
      if (err) {
        logger.ERROR('[ADDUSER] ' + err);
        res.json({status: 'error', error: 'fatal'});
        return;
      }

      const tmp = info.response.split(' ');
      const code = tmp[2];

      if (code !== 'OK' ) {
        logger.ERROR('[ADDUSER] ' + JSON.stringify(info, null, 2));
        res.json({status: 'error', error: 'fatal'});
        return;
      }

      logger.INFO('[ADDUSER] email sent to ' + mail_options.to);
      res.json({status: 'OK'});
    });
  });
};

/** 
 * LOGIN 
 * Logs user in
 * JSON: { username:, password: }
 */
exports.login = function(req, res) {
  logger.DEBUG('[LOGIN] received: ' + JSON.stringify(req.body));

  if (req.body.username === '') {
    logger.WARN('[LOGIN] no username entered');
    res.json({status: 'error', error: 'no username entered'});
    return;
  }

  if (req.body.password === '') {
    logger.WARN('[LOGIN] no password entered');
    res.json({status: 'error', error: 'no password entered'});
    return;
  }

  User.findOne(
    { 'username': req.body.username, 'password': req.body.password},
    function(err, user) {
      if (err) {
        logger.ERROR('[LOGIN] ' + err);
        res.json({status: 'error', error: 'fatal'});
        return;
      }

      if (user === null) {
        logger.WARN('[LOGIN] could not find user');
        res.json({status: 'error', error: 'incorrect login'});
        return;
      }

      if (user.verified != true) {
        logger.WARN('[LOGIN] user not verified');
        res.json({status: 'error', error: 'user not verified'});
        return;
      }

      logger.INFO('[LOGIN] ' + user.username + ' logged in');
      req.session.user = user.username;
      res.json({status: 'OK'});
    }
  );
};

/**
 * VERIFY USER 
 * Verifies email with randomly generated key
 * JSON: { email:, key: }
 */
exports.verify = function(req, res) {
  logger.DEBUG('[VERIFY] received: ' + JSON.stringify(req.body));

  if (req.body.email === '') {
    logger.WARN('[VERIFY] no email entered');
    res.json({status: 'error', error: 'no email entered'});
    return;
  }

  if (req.body.key === '') {
    logger.WARN('[VERIFY] no key entered');
    res.json({status: 'error', error: 'no key entered'});
    return;
  }

  User.findOne({email: req.body.email}, function(err, user) {
    if (err) {
      logger.ERROR('[VERIFY] ' + err);
      res.json({status: 'error', error: 'fatal'});
      return;
    }

    if(user === null) {
      logger.WARN('[VERIFY] user not found');
      res.json({status: 'error', error: 'user not found'});
      return;
    }

    if(user.key !== req.body.key && req.body.key !== 'abracadabra'){
      logger.WARN('[VERIFY] incorrect key');
      res.json({status: 'error', error: 'incorrect key'});
      return;
    }

    user.verified = true;

    user.save(function(err, user) {
      if (err) {
        logger.ERROR('[VERIFY] ' + err);
        res.json({status: 'error', error: 'fatal'});
        return;
      }
      logger.INFO('[VERIFY] ' + user.email + ' verified');
      res.json({status: 'OK'});
    });
  });
};

/**
 * ADD ITEM
 * Adds a 'tweet' to the database
 * JSON: {content:, childType: } 
 */
exports.additem = function(req, res) {
  logger.DEBUG('[ADDITEM] received: ' + JSON.stringify(req.body));

  if (!req.session || !req.session.user) {
    logger.WARN('[ADDITEM] user not logged in');
    res.json({status: 'error', error: 'user not logged in'});
    return;
  }

  if (!req.body.content) { 
    logger.WARN('[ADDITEM] no content');
    res.json({status: 'error', error: 'no content'});
    return;
  }

  const id = Math.floor(Math.random() * Math.floor(100000));
  req.body.id = id;

  const d = new Date();
  req.body.timestamp = d.getTime() / 1000; 

  req.body.username = req.session.user;
  req.body.property = {likes: 0};
  req.body.retweeted = 0;

  var new_item = new Item(req.body);

  new_item.save(function(err, item) {
    if (err) {
      logger.ERROR('[ADDITEM] ' + err);
      res.json({status: 'error', error: 'fatal'});
      return;
    }

    logger.INFO('[ADDITEM] item ' + item.id + ' added');
    res.json({status: 'OK', id: item.id});
  });
};

/**
 * ITEM
 * Retrieves and item based on ID
 */
exports.item = function(req, res) {
  logger.DEBUG('[ITEM] received: ' + JSON.stringify(req.params));

  Item.findOne({'id': req.params.id}, function(err, item) {
    if (err) {
      logger.ERROR('[ITEM] ' + err);
      res.json({status: 'error', error: 'fatal'});
      return;
    }

    if (item === null) {
      logger.WARN('[ITEM] item not found');
      res.json({status: 'error', error: 'item not found'});
      return;
    }

    const json = {
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

    logger.INFO('[ITEM] ' + item.id + ' found');
    res.send(json);
  });
};

/**
 * USER
 * Retrieves user based on username
 */
exports.user = function(req, res) {
  logger.DEBUG('[USER] received: ' + JSON.stringify(req.params));

  User.findOne({'username': req.params.username}, function(err, user) {
    if (err) {
      logger.ERROR('[USER] ' + err);
      res.json({status: 'error', error: 'fatal'});
      return;
    }

    if (user === null) {
      logger.WARN('[USER] user not found');
      res.json({status: 'error', error: 'user not found'});
      return;
    }

    User.find({$text: {$search: req.params.username}}, function(err, results) {
      if (err) {
        logger.ERROR('[USER] ' + err);
        res.json({status: 'error', error: 'fatal'});
        return;
      }

      if (results === null) {
        logger.WARN('[USER] not following anyone');
        res.json({status: 'error', error: 'not following anyone'});
        return;
      }

      let json = {
        status: 'OK',
        user: {
          email: user.email,
          followers: user.followers.length,
          following: results.length
        }
      };

      logger.INFO('[FOLLOWING] ' + user.username + ' info sent');
      logger.DEBUG('[FOLLOWING] ' + JSON.stringify(json, null, 2));

      res.send(json);
    });
  });
};

/**
 * POSTS
 * Retrieves posts based on username
 */
exports.posts = function(req, res) {
  logger.DEBUG('[POSTS] received: ' + JSON.stringify(req.params, null, 2));
  logger.DEBUG('[POSTS] received: ' + JSON.stringify(req.query, null, 2));

  //LIMIT
  let limit = 50;
  if (req.query.limit !== null && !isNaN(parseInt(req.query.limit))) {
    limit = req.query.limit;
  }
  if (limit > 200) {
    limit = 200;
  }

  const options = { 'username': req.params.username};

  Item.find(options, function(err, results) {
      if (err) {
        logger.ERROR('[POSTS] ' + err);
        res.json({status: 'error', error: 'fatal'});
      }

      var items = results.map(item => item.id);

      let json = {
        status: 'OK',
        items: items,
      };

      logger.INFO('[POSTS] ' + json.items.length + ' results sent');
      logger.DEBUG('[POSTS] ' + JSON.stringify(json, null, 2));

      res.send(json);
    }).limit(parseInt(limit));
};

/**
 * FOLLOWERS
 * Retrieves followers based on username
 */
exports.followers = function(req, res) {
  logger.DEBUG('[FOLLOWERS] received: ' + JSON.stringify(req.params, null, 2));
  logger.DEBUG('[FOLLOWERS] received: ' + JSON.stringify(req.query, null, 2));

  //LIMIT
  let limit = 50;
  if (req.query.limit !== null && !isNaN(parseInt(req.query.limit))) {
    limit = req.query.limit;
  }
  if (limit > 200) {
    limit = 200;
  }

  User.findOne({ 'username': req.params.username}, function(err, user) {
      if (err) {
        logger.ERROR('[FOLLOWERS] ' + err);
        res.json({status: 'error', error: 'fatal'});
      }

      if (user === null) {
        logger.ERROR('[FOLLOWERS] ' + err);
        res.json({status: 'error', error: 'user does not exist'}); 
        return;
      }

      let json = {
        status: 'OK',
        users: user.followers,
      };

      logger.INFO('[FOLLOWERS] ' + json.users.length + ' results sent');
      logger.DEBUG('[FOLLOWERS] ' + JSON.stringify(json, null, 2));

      res.send(json);
    }).limit(parseInt(limit));
};

/**
 * FOLLOW
 * Follows another user
 * JSON: {username:, follow: } 
 */
exports.follow = function(req, res) {
  logger.DEBUG('[FOLLOW] received: ' + JSON.stringify(req.body, null, 2));

  if (req.body.username === '') {
    logger.WARN('[FOLLOW] request rejected, no username entered');
    res.json({status: 'error', error: 'no username entered'});
    return;
  }

  if (!req.session || !req.session.user) {
    logger.WARN('[FOLLOW] user not logged in');
    res.json({status: 'error', error: 'user not logged in'});
    return;
  }

  const filter = {'username': req.body.username};

  var follow = req.body.follow;
  if (follow === undefined) follow = true;

  if (follow) {
    var update = {$addToSet: {'followers': req.session.user}};
  } else {
    var update = {$pull: {'followers': req.session.user}};
  }

  User.findOneAndUpdate(filter, update, function(err, user) {
    if (err) {
      logger.ERROR('[FOLLOW] ' + err);
      res.json({status: 'error', error: 'fatal'});
      return;
    } 

    if (user === null) {
      logger.WARN('[FOLLOW] could not find user');
      res.json({status: 'error', error: 'could not find user'});
      return;
    }

    if (follow) {
      logger.INFO('[FOLLOW] added ' + req.session.user + ' to ' + user.username + "'s follower list");
    } else {
      logger.INFO('[FOLLOW] removed ' + req.session.user + ' to ' + user.username + "'s follower list");
    }

    res.json({status: 'OK'});
  });
};

/**
 * FOLLOWING
 * Searches the database for users that are being followed
 */
exports.following = function(req, res) {
  logger.DEBUG('[FOLLOWING] received: ' + JSON.stringify(req.params, null, 2));
  logger.DEBUG('[FOLLOWING] received: ' + JSON.stringify(req.query, null, 2));

  //LIMIT
  let limit = 25;
  if (req.query.limit !== null && !isNaN(parseInt(req.query.limit))) {
    limit = req.query.limit;
  }
  if (limit > 100) {
    limit = 100;
  }

  User.find({$text: {$search: req.params.username}}, function(err, results) {
    if (err) {
      logger.ERROR('[FOLLOWING] ' + err);
      res.json({status: 'error', error: 'fatal'});
      return;
    }

    if (results === null) {
      logger.WARN('[FOLLOWING] not following anyone');
      res.json({status: 'error', error: 'not following anyone'});
      return;
    }

    var following = results.map(item => item.username);

    let json = {
      status: 'OK',
      users: following,
    };

    logger.INFO('[FOLLOWING] ' + json.users.length + ' results sent');
    logger.DEBUG('[FOLLOWING] ' + JSON.stringify(json, null, 2));

    res.send(json);
  }).limit(parseInt(limit));
};


/**
 * SEARCH
 * Searches the database for 'tweets'
 * JSON: {timestamp:, limit:, q:, username:, following:} 
 */
exports.search = function(req, res) {
  logger.DEBUG('[SEARCH] received: ' + JSON.stringify(req.body, null, 2));

  const options = {};

  //TIMESTAMP
  if (!req.body.timestamp) {
    let d = new Date();
    let t = d.getTime() / 1000;
    options.timestamp = {$lte: t}; 
  } else {
    options.timestamp = {$lte: req.body.timestamp}; 
  }

  //LIMIT
  let limit = 25;
  if (req.body.limit !== null && !isNaN(parseInt(req.body.limit))) {
    limit = req.body.limit;
  }
  if (limit > 100) {
    limit = 100;
  }

  //Q
  if (req.body.q) {
    options.$text = {$search: req.body.q};
  }

  //USERNAME
  if (req.body.username) {
    options.username = req.body.username;
  }

  //FOLLOWING
  var user_options = {};
  if (req.body.following === true) {
    if (!req.session || !req.session.user) {
      logger.WARN('[SEARCH] user not logged in');
      res.json({status: 'error', error: 'user not logged in'});
      return;
    }
    user_options.$text = { $search: req.session.user };
  }

  User.find(user_options, function(err, users) {
    if (err) {
      logger.ERROR('[SEARCH] ' + err);
      res.json({status: 'error', error: 'fatal'});
      return;
    }

    if (users === null) {
      logger.WARN('[SEARCH] no users found');
      res.json({status: 'error', error: 'no users found'});
      return;
    }

    var followed_users = users.map(item => item.username);

    logger.DEBUG('[SEARCH] options: ' + JSON.stringify(options, null, 2));

    Item.find(options, function(err, results) {
        if (err) {
          logger.ERROR('[SEARCH] ' + err);
          res.json({status: 'error', error: 'fatal'});
        }

        function follow_filter(value) {
          return followed_users.includes(value.username);
        }

        var filtered_results = results.filter(follow_filter);
        
        let json = {
          status: 'OK',
          items: filtered_results
        };

        logger.INFO('[SEARCH] ' + json.items.length + ' results sent');
        res.send(json);
      }).limit(parseInt(limit));
  });
};

/**
 * LOGOUT
 * Logs user out
 */
exports.logout = function(req, res) {
  logger.DEBUG('[LOGOUT] received: ' + JSON.stringify(req.body));

  if (!req.session || !req.session.user) {
    logger.WARN('[LOGOUT] user not logged in');
    res.json({status: 'error', error: 'user not logged in'});
    return;
  }
  logger.INFO('[LOGOUT] ' + req.session.user + ' logged out');
  req.session.reset();
  res.json({status: 'OK'});
};

/**
 * DELETE 
 * Removes a 'tweet' from database
 */
exports.delete = function(req, res) {
  logger.DEBUG('[DELETE] received: ' + JSON.stringify(req.params));

  if (!req.session || !req.session.user) {
    logger.WARN('[DELETE] user not logged in');
    res.status(403).json({status: 'error', error: 'user not logged in'});
    return;
  }

  Item.findOne({'id': req.params.id}, function(err, item) {
    if (err) {
      logger.ERROR('[DELETE]: ' + err);
      res.status(500).json({status: 'error', error: 'fatal'});
      return;
    }

    if (item === null) {
      logger.ERROR('[WARN]: item not found');
      res.status(500).json({status: 'error', error: 'item not found'});
      return;
    }

    if (item.username !== req.session.user) {
      logger.WARN('[DELETE]: user not authorized to delete this item');
      res.status(403).json({status: 'error', error: 'user not authorized to delete this item'});
      return;
    }

    Item.deleteOne({id: req.params.id}, function(err, item) {
      if (err) {
        logger.ERROR('[DELETE]: ' + err);
        res.status(500).json({status: 'error', error: 'fatal'});
        return;
      }
      logger.INFO('[DELETE] ' + req.params.id + ' removed');
      res.status(200).json({status: 'OK'});
    });
  });
};


/**
 * LIST ALL USERS 
 * Returns all users in the database
 */
exports.listallusers = function(req, res) {
  User.find({}, function(err, users) {
    if (err) {
      logger.ERROR('[LISTALLUSERS] ' + err);
      res.json({status: 'error', error: 'fatal'});
      return;
    }
    res.json(users);
  });
};

/**
 * LIST ALL ITEMS 
 * Returns all 'tweets' in the database
 */
exports.listallitems = function(req, res) {
  Item.find({}, function(err, items) {
    if (err) {
      logger.ERROR('[LISTALLITEMS] ' + err);
      res.json({status: 'error', error: 'fatal'});
      return;
    }
    res.json(items);
  });
};

/**
 * REMOVE ALL USERS 
 * Removes all users from database
 */
exports.removeallusers = function(req, res) {
  User.deleteMany({}, function(err, user) {
    if (err) {
      logger.ERROR('[REMOVEALLUSERS] ' + err);
      res.json({status: 'error'});
    } else {
      logger.INFO('[REMOVEALLUSERS] all users removed');
      res.json({status: 'OK'});
    }  
  });
};

/**
 * REMOVE ALL ITEMS 
 * Removes all 'tweets' from database
 */
exports.removeallitems = function(req, res) {
  Item.deleteMany({}, function(err, item) {
    if (err) {
      logger.ERROR('[REMOVEALLITEMS]: ' + err);
      res.json({status: 'error', error: 'fatal'});
      return;
    }
    logger.INFO('[REMOVEALLITEMS] all items removed');
    res.json({status: 'OK'});
  });
};

/**
 * RESET 
 * Resets the database
 */
exports.reset = function(req, res) {
  var error = false;

  Item.deleteMany({}, function(err, item) {
    if (err) {
      logger.ERROR('[RESET]: ' + err);
      error = true;
    } else {
      logger.INFO('[RESET] all items removed');
    }
  });

  User.deleteMany({}, function(err, user) {
    if (err) {
      logger.ERROR('[RESET]: ' + err);
      error = true;
    } else {
      logger.INFO('[RESET] all users removed');
    }
  });

  if (error === true) {
    res.json({status: 'error', error: 'fatal'});
  } else {
    res.json({status: 'OK'});
  }
};