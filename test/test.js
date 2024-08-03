import chai, { assert } from 'chai';
import chaiHttp from 'chai-http';
import server from '../server.js';

chai.use(chaiHttp);

describe('user tests', () => {
    let res;
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

    it('removing users from database', async () => {
        //add user_0
        res = await chai.request(server).post('/adduser').send(user_0);
        text = JSON.parse(res.text);
        assert.equal(200, res.statusCode);
        assert.equal('OK', text.status);

        //add user_1
        res = await chai.request(server).post('/adduser').send(user_1);
        text = JSON.parse(res.text);
        assert.equal(200, res.statusCode);
        assert.equal('OK', text.status);

        //remove all users
        res  = await chai.request(server).post('/removeallusers');
        text = JSON.parse(res.text);
        assert.equal(200, res.statusCode);
        assert.equal('OK', text.status);

        //attempt to get user_0
        res = await chai.request(server).get(`/user/${user_0.username}`);
        text = JSON.parse(res.text);
        assert.equal(404, res.statusCode);
        assert.equal('error', text.status);
        assert.equal('user not found', text.error);

        //attempt to get user_1
        res = await chai.request(server).get(`/user/${user_1.username}`);
        text = JSON.parse(res.text);
        assert.equal(404, res.statusCode);
        assert.equal('error', text.status);
        assert.equal('user not found', text.error);

        //attempt to list all users
        res = await chai.request(server).post('/listallitems');
        text = JSON.parse(res.text);
        assert.equal(200, res.statusCode);
        assert.isArray(JSON.parse(res.text));
        assert.isEmpty(JSON.parse(res.text));
    });

    it('add user', async () => {
        //reset database
        res  = await chai.request(server).post('/removeallusers');
        text = JSON.parse(res.text);
        assert.equal(200, res.statusCode);
        assert.equal('OK', text.status);

        //add user
        res = await chai.request(server).post('/adduser').send(user_0);
        text = JSON.parse(res.text);
        assert.equal(200, res.statusCode);
        assert.equal('OK', text.status);

        //attempt to add user again
        res = await chai.request(server).post('/adduser').send(user_0);
        text = JSON.parse(res.text);
        assert.equal(400, res.statusCode);
        assert.equal('error', text.status);
        assert.equal('user already exists', text.error);

        //attempt to get user
        res = await chai.request(server).get(`/user/${user_0.username}`);
        text = JSON.parse(res.text);
        assert.equal(200, res.statusCode);
        assert.equal('OK', text.status);
        assert.equal(user_0.email, text.user.email);
        assert.isArray(text.user.following);
        assert.isArray(text.user.followers);
        assert.isEmpty(text.user.following);
        assert.isEmpty(text.user.followers);
    });
});

describe('admin tests', () => {
    it('reset database', async () => {
        //reset database
        let res  = await chai.request(server).post('/reset');
        let text = JSON.parse(res.text);
        assert.equal(200, res.statusCode);
        assert.equal('OK', text.status);

        //TODO check that all the items are empty
    });
});