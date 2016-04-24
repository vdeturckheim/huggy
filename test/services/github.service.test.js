'use strict';
const HttpStatus = require('http-status-codes'); // list of HTTP status
const Mongoose = require('mongoose');
const Code = require('code'); // assertion lib
const Lab = require('lab'); // test runner
const lab = exports.lab = Lab.script();

const describe = lab.describe;
const it = lab.it;
const before = lab.before;
const after = lab.after;
// const beforeEach = lab.beforeEach;
const afterEach = lab.afterEach;
const expect = Code.expect;

require('maitredhotel');
const User = Mongoose.model('User');
const Proxyquire = require('proxyquire');

const mockOk = {
    octonode: {
        client: function () {

            return {

                gist: function () {

                    return {
                        public: function (cb) {

                            return cb(null, ['tba']);
                        }
                    };
                }
            };
        }
    }
};

const mockNok = {
    octonode: {
        client: function () {

            return {

                gist: function () {

                    return {
                        public: function (cb) {

                            return cb(new Error('errList'));
                        }
                    };
                }
            };
        }
    }
};

const Service = Proxyquire('../../lib/services/github.service', mockOk);
const ServiceFail = Proxyquire('../../lib/services/github.service', mockNok);

const mockedServer = { log: console.log };

Mongoose.Promise = global.Promise; // Personal choice

before(() => Mongoose.connect(`mongodb://localhost/huggy_test_github_service_${Date.now()}`));


after(() => Mongoose.disconnect());

afterEach((done) => {

    Mongoose.connection.db.dropDatabase();
    done();
});

describe('listGists', () => {

    it('should list the gists of a user', { plan: 2 }, () => {

        const user = new User({
            githubid: '1',
            username: 'user',
            githubToken: '10'
        });

        return user.save()
            .then(() => Service.listGists(user._id, mockedServer))
            .then((gists) => {

                expect(gists).to.be.an.array();
                expect(gists).to.have.length(1);
            });
    });

    it('should not list the gists of a wrong user', { plan: 1 }, () => {


        return Service.listGists(Mongoose.Types.ObjectId(), mockedServer)
            .catch((err) => {

                expect(err.output.statusCode).to.equal(HttpStatus.NOT_FOUND);
            });
    });

    it('should list the gists of a user and fail later', { plan: 1 }, () => {

        const user = new User({
            githubid: '1',
            username: 'user',
            githubToken: '10'
        });

        return user.save()
            .then(() => ServiceFail.listGists(user._id, mockedServer))
            .catch((err) => {

                expect(err).to.exist();
            });
    });
});
