'use strict';

//GET
import home from './controllers/home.js';
import media from './controllers/media.js';
import item from './controllers/item.js';
import user from './controllers/user.js';
import posts from './controllers/posts.js';
import followers from './controllers/followers.js';
import following from './controllers/following.js';

//DELETE
import remove from './controllers/remove.js';

//POST
import adduser from './controllers/adduser.js';
import additem from './controllers/additem.js';
import addmedia from './controllers/addmedia.js';
import login from './controllers/login.js';
import logout from './controllers/logout.js';
import verify from './controllers/verify.js';
import search from './controllers/search.js';
import follow from './controllers/follow.js';
import loggedin from './controllers/loggedin.js';
import like from './controllers/like.js';

//ADMIN
import listallitems from './admin/listallitems.js';
import listallmedia from './admin/listallmedia.js';
import listallusers from './admin/listallusers.js';
import removeallitems from './admin/removeallitems.js';
import removeallmedia from './admin/removeallmedia.js';
import removeallusers from './admin/removeallusers.js';
import reset from './admin/reset.js';

export default function router(app) {
    //GET
    app.route('/').get(home);
    app.route('/media/:id').get(media);
    app.route('/item/:id').get(item);
    app.route('/user/:username').get(user);
    app.route('/user/:username/posts').get(posts);
    app.route('/user/:username/followers').get(followers);
    app.route('/user/:username/following').get(following);

    //DELETE
    app.route('/item/:id').delete(remove);

    //POST
    app.route('/adduser').post(adduser);
    app.route('/additem').post(additem);
    app.route('/addmedia').post(addmedia);
    app.route('/login').post(login);
    app.route('/logout').post(logout);
    app.route('/verify').post(verify);
    app.route('/search').post(search);
    app.route('/follow').post(follow);
    app.route('/loggedin').post(loggedin);
    app.route('/item/:id/like').post(like);

    //ADMIN
    app.route('/listallitems').post(listallitems);
    app.route('/listallusers').post(listallusers);
    app.route('/listallmedia').post(listallmedia);
    app.route('/removeallitems').post(removeallitems);
    app.route('/removeallusers').post(removeallusers);
    app.route('/removeallmedia').post(removeallmedia);
    app.route('/reset').post(reset);
};
