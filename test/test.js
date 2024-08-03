import chai, { assert } from 'chai';
import chaiHttp from 'chai-http';
import server from '../server.js';

chai.use(chaiHttp);

async function send_post(address, expected_status_code, json) {
    const response = await chai.request(server).post(address).send(json);
    assert.equal(expected_status_code, response.statusCode);
    return JSON.parse(response.text);
}

async function send_get(address, expected_status_code) {
    const response = await chai.request(server).get(address);
    assert.equal(expected_status_code, response.statusCode);
    return JSON.parse(response.text);
}

async function send_delete(address, expected_status_code) {
    const response = await chai.request(server).delete(address);
    assert.equal(expected_status_code, response.statusCode);
    return JSON.parse(response.text);
}

let text;
const user_0 = {
    username: 'user_0',
    password: 'password_0',
    email: 'email_0@example.com'
};
const user_1 = {
    username: 'user_1',
    password: 'password_1',
    email: 'email_1@example.com'
};

describe('admin tests', () => {
    it('reset database', async () => {
        //reset database
        text = await send_delete('/reset', 200);
        assert.equal('OK', text.status);

        //get item list
        text = await send_get('/listallitems', 200);
        assert.isArray(text);
        assert.isEmpty(text);

        //get media list
        text = await send_get('/listallmedia', 200);
        assert.isArray(text);
        assert.isEmpty(text);

        //get user list
        text = await send_get('/listallusers', 200);
        assert.isArray(text);
        assert.isEmpty(text);
    });
    it('remove all users', async () => {
        //add user_0
        text = await send_post('/adduser', 200, user_0);
        assert.equal('OK', text.status);

        //add user_1
        text = await send_post('/adduser', 200, user_1);
        assert.equal('OK', text.status);

        //list all users
        text = await send_get('/listallusers', 200);
        assert.isArray(text);
        assert.lengthOf(text, 2);
        assert.equal(text[0].username, user_0.username);
        assert.equal(text[0].password, user_0.password);
        assert.equal(text[0].email, user_0.email);
        assert.equal(text[1].username, user_1.username);
        assert.equal(text[1].password, user_1.password);
        assert.equal(text[1].email, user_1.email);

        //remove all users
        text = await send_delete('/removeallusers', 200);
        assert.equal('OK', text.status);

        //list all users
        text = await send_get('/listallusers', 200);
        assert.isArray(text);
        assert.isEmpty(text);
    });
});

describe('user tests', () => {
    it('add user', async () => {
        //add user_0
        text = await send_post('/adduser', 200, user_0);
        assert.equal('OK', text.status);

        //add user_1
        text = await send_post('/adduser', 200, user_1);
        assert.equal('OK', text.status);

        //add user_0 again
        text = await send_post('/adduser', 400, user_0);
        assert.equal('error', text.status);
        assert.equal('user already exists', text.error);

        //add user_1 again
        text = await send_post('/adduser', 400, user_1);
        assert.equal('error', text.status);
        assert.equal('user already exists', text.error);

        //attempt to get user_0
        text = await send_get(`/user/${user_0.username}`, 200);
        assert.equal('OK', text.status);
        assert.equal(user_0.email, text.user.email);
        assert.isArray(text.user.following);
        assert.isArray(text.user.followers);
        assert.isEmpty(text.user.following);
        assert.isEmpty(text.user.followers);

        //attempt to get user_1
        text = await send_get(`/user/${user_1.username}`, 200);
        assert.equal('OK', text.status);
        assert.equal(user_1.email, text.user.email);
        assert.isArray(text.user.following);
        assert.isArray(text.user.followers);
        assert.isEmpty(text.user.following);
        assert.isEmpty(text.user.followers);
    });
});