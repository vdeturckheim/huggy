'use strict';
const Code = require('code'); // assertion lib
const Lab = require('lab'); // test runner
const lab = exports.lab = Lab.script();

const describe = lab.describe;
const it = lab.it;
const expect = Code.expect;

// Mock library
const Proxyquire = require('proxyquire');

const mockOk = {
    octonode: {
        client: function () {

            return {

                gist: function () {

                    return {
                        public: function (cb) {

                            return cb(null, ['tba']);
                        },
                        get: function (id, cb) {

                            return cb(null, 'tba');
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
                        },
                        get: function (id, cb) {

                            return cb(new Error('errGet'));
                        }
                    };
                }
            };
        }
    }
};

const GithubMockedOk = Proxyquire('../../lib/utils/github.utils', mockOk);
const GithubMockedNok = Proxyquire('../../lib/utils/github.utils', mockNok);
const Github = require('../../lib/utils/github.utils');

describe('Github', () => {

    it('should get an instance of our Github handler', { plan: 3 }, (done) => {

        const github = new Github('10');
        expect(github).to.be.an.instanceof(Github);
        expect(github.client).to.exist();
        expect(github.gistClient).to.exist();
        done();
    });
});

describe('GithubMockedOk', () => {

    it('should get an instance of our Github handler', { plan: 3 }, (done) => {

        const github = new GithubMockedOk('10');
        expect(github).to.be.an.instanceof(Github);
        expect(github.client).to.exist();
        expect(github.gistClient).to.exist();
        done();
    });

    it('should get a promise with alist of gists', { plan: 1 }, () => {

        const github = new GithubMockedOk('10');
        return github.gists
            .then((list) => {

                expect(list).to.deep.equal(['tba']);
            });
    });

    it('should get a promise with a sing gist', { plan: 1 }, () => {

        const github = new GithubMockedOk('10');
        return github.getGist('0')
            .then((gist) => {

                expect(gist).to.equal('tba');
            });
    });
});

describe('GithubMockedNok', () => {

    it('should get an instance of our Github handler', { plan: 2 }, (done) => {

        const github = new GithubMockedNok('10');
        expect(github.client).to.exist();
        expect(github.gistClient).to.exist();
        done();
    });

    it('should get a promise with alist of gists', { plan: 1 }, () => {

        const github = new GithubMockedNok('10');
        return github.gists
            .catch((err) => {

                expect(err).to.exist();
            });
    });

    it('should get a promise with a sing gist', { plan: 1 }, () => {

        const github = new GithubMockedNok('10');
        return github.getGist('0')
            .catch((err) => {

                expect(err).to.exist();
            });
    });
});
