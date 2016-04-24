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
const Article = require('../../lib/models/article.model');
const Service = require('../../lib/services/articles.service');

const mockedServer = { log: console.log };

Mongoose.Promise = global.Promise; // Personal choice

before(() => Mongoose.connect(`mongodb://localhost/huggy_test_article_service_${Date.now()}`));


after(() => Mongoose.disconnect());

afterEach((done) => {

    Mongoose.connection.db.dropDatabase();
    done();
});

describe('listArticles', () => {

    it('should list the articles of a user', { plan: 3 }, () => {

        const user = new User({
            githubid: '1',
            username: 'user'
        });
        const article = new Article({
            title: 'a',
            gistId: '01',
            user: user._id
        });

        return Promise.all([user.save(), article.save()])
            .then(() => Service.listArticles(user._id, mockedServer))
            .then((articles) => {

                expect(articles).to.be.an.array();
                expect(articles).to.have.length(1);
                expect(articles[0]._id + '').to.equal(article._id + '');
            });
    });
});

describe('createArticle', () => {

    it('should create a new article', { plan: 4 }, () => {

        const user = new User({
            githubid: '1',
            username: 'user'
        });

        let id;
        return user.save()
            .then(() => Service.createArticle(user._id, '01', 'helo', mockedServer))
            .then((article) => {

                id = article._id;
            })
            .then(() => Article.find({ user: user._id }).exec())
            .then((articles) => {

                expect(articles).to.be.an.array();
                expect(articles).to.have.length(1);
                expect(articles[0]._id + '').to.equal(id + '');
                expect(articles[0].published).to.be.false();
            });
    });
});

describe('read', () => {

    it('should read an article', { plan: 1 }, () => {

        const user = new User({
            githubid: '1',
            username: 'user'
        });
        const article = new Article({
            title: 'a',
            gistId: '01',
            user: user._id
        });

        return Promise.all([user.save(), article.save()])
            .then(() => Service.read(article._id, mockedServer))
            .then((articleRead) => {

                expect(articleRead._id + '').to.equal(article._id + '');
            });
    });

    it('should not find an article', { plan: 1 }, () => {

        return Service.read(Mongoose.Types.ObjectId(), mockedServer)
            .catch((err) => {

                expect(err.output.statusCode).to.equal(HttpStatus.NOT_FOUND);
            });
    });
});

describe('update', () => {

    it('should update an article', { plan: 3 }, () => {

        const user = new User({
            githubid: '1',
            username: 'user'
        });
        const article = new Article({
            title: 'a',
            gistId: '01',
            user: user._id
        });

        return Promise.all([user.save(), article.save()])
            .then(() => Service.update(article._id, { title: 'b', published: true }, mockedServer))
            .then((articleRead) => {

                expect(articleRead._id + '').to.equal(article._id + '');
                expect(articleRead.title).to.equal('b');
                expect(articleRead.published).to.be.true();
            });
    });

    it('should not update an article', { plan: 1 }, () => {

        return Service.update(Mongoose.Types.ObjectId(), {}, mockedServer)
            .catch((err) => {

                expect(err.output.statusCode).to.equal(HttpStatus.NOT_FOUND);
            });
    });
});


describe('destroy', () => {

    it('should destroy an article', { plan: 2 }, () => {

        const user = new User({
            githubid: '1',
            username: 'user'
        });
        const article = new Article({
            title: 'a',
            gistId: '01',
            user: user._id
        });

        return Promise.all([user.save(), article.save()])
            .then(() => Service.destroy(article._id, mockedServer))
            .then(() => Article.find().exec())
            .then((articles) => {

                expect(articles).to.be.an.array();
                expect(articles).to.have.length(0);
            });
    });

    it('should not destroy an article', { plan: 1 }, () => {

        return Service.destroy(Mongoose.Types.ObjectId(), mockedServer)
            .catch((err) => {

                expect(err.output.statusCode).to.equal(HttpStatus.NOT_FOUND);
            });
    });
});
