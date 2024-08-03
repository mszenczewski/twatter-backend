import chai, { assert } from 'chai';
import chaiHttp from 'chai-http';
import server from '../server.js';

chai.use(chaiHttp);

describe('user tests', () => {
    it('register user', async () => {
        const user = {
            username: 'test_user',
            password: 'test_password',
            email: 'testemail@testemail.com'
        };

        //reset database
        let res  = await chai.request(server).post('/reset');
        let text = JSON.parse(res.text);

        assert.equal(200, res.statusCode);
        assert.equal('OK', text.status);

        //add user
        res = await chai.request(server).post('/adduser').send(user);
        text = JSON.parse(res.text);

        assert.equal(200, res.statusCode);
        assert.equal('OK', text.status);

        //attempt to add user again
        res = await chai.request(server).post('/adduser').send(user);
        text = JSON.parse(res.text);

        assert.equal(400, res.statusCode);
        assert.equal('error', text.status);
        assert.equal('user already exists', text.error);

        //attempt to get user
        res = await chai.request(server).get(`/user/${user.username}`);
        text = JSON.parse(res.text);

        assert.equal(200, res.statusCode);
        assert.equal('OK', text.status);
        assert.equal(user.email, text.user.email);
        assert.isArray(text.user.following);
        assert.isArray(text.user.followers);
        assert.lengthOf(text.user.following, 0);
        assert.lengthOf(text.user.followers, 0);
    });
});