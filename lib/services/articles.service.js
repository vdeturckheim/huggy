'use strict';
const Boom = require('boom');
const Article = require('../models/article.model');

module.exports.listArticles = function (userId, server) {

    server.log(['articles', 'list'], `List articles for user ${userId}`);
    return Article.find({ user: userId }).exec();
};

module.exports.createArticle = function (userId, gistId, title, server) {

    server.log(['articles', 'create'], `create article for user ${userId}`);
    const article = new Article({ user: userId, gistId: gistId, title: title });
    return article.save()
        .then(() => article);
};

module.exports.update = function (articleId, candidateArticle, server) {

    delete candidateArticle.user;

    server.log(['articles', 'unpublish'], `unpublish article ${articleId}`);
    return Article.findOneAndUpdate({ _id: articleId }, { $set: candidateArticle }, { new: true } ).exec()
        .then((article) => {

            if (!article) {
                server.log(['articles', 'unpublish'], `article.not.found ${articleId}`);
                return Promise.reject(Boom.notFound('article', { articleId }));
            }
            server.log(['articles', 'unpublish'], `article unpublished ${articleId}`);
            return article;
        });
};

module.exports.read = function (articleId, server) {

    server.log(['articles', 'read'], `read article ${articleId}`);
    return Article.findOne({ _id: articleId }).exec()
        .then((article) => {

            if (!article) {
                server.log(['articles', 'read'], `article.not.found ${articleId}`);
                return Promise.reject(Boom.notFound('article', { articleId }));
            }
            server.log(['articles', 'read'], `article found ${articleId}`);
            return article;
        });
};

module.exports.destroy = function ( articleId, server) {

    server.log(['articles', 'destroy'], `destroy article ${articleId}`);
    return Article.findOneAndRemove({ _id: articleId }, { new: false } ).exec()
        .then((article) => {

            if (!article) {
                server.log(['articles', 'destroy'], `article.not.found ${articleId}`);
                return Promise.reject(Boom.notFound('article', { articleId }));
            }
            server.log(['articles', 'destroy'], `article destroyed ${articleId}`);
        });
};
