import chai, { assert } from 'chai';
import chaiHttp from 'chai-http';
import server from '../server.js';

chai.use(chaiHttp);

describe('user tests', () => {
    it('register user', async () => {
        let res  = await chai.request(server).post('/reset');
        let text = JSON.parse(res.text);

        assert.equal(200, res.statusCode);
        assert.equal('OK', text.status);

        const json = {
            username: 'test_user',
            password: 'test_password',
            email: 'testemail@testemail.com'
        };

        res = await chai.request(server).post('/adduser').send(json);
        text = JSON.parse(res.text);

        assert.equal(200, res.statusCode);
        assert.equal('OK', text.status);

        res = await chai.request(server).post('/adduser').send(json);
        text = JSON.parse(res.text);

        assert.equal(400, res.statusCode);
        assert.equal('error', text.status);
        assert.equal('user already exists', text.error);

        //TODO verify the user was added

    });
});