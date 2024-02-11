import chai, { expect } from 'chai';
import chaiHttp from 'chai-http';
import server from '../server.js';

chai.use(chaiHttp);

describe('user tests', () => {
    it('register user', async () => {
        const json = {
            username: 'mike',
            password: 'mike_password',
            email: 'mike@email.com'
        };

        const res = await chai.request(server).post('/adduser').send(json);
        expect(res).to.have.status(200);
    });
});