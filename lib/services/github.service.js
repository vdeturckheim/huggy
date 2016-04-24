'use strict';
const Boom = require('boom');
const Mongoose = require('mongoose');
const User = Mongoose.model('User');

const Github = require('octonode');

module.exports.listGists = function (userId, server) {

    server.log(['gists', 'list'], `listing gists for user ${userId}`);
    return User.findById(userId)
        .select('githubToken').exec()
        .then((user) => {

            if (!user) {
                server.log(['gists', 'list'], `user.not.found ${userId}`);
                return Promise.reject(Boom.notFound('user', { userId }));
            }
            return user.githubToken;
        })
        .then((githubToken) => Github.client(githubToken))
        .then((client) => client.gist())
        .then((client) => {

            return new Promise((resolve, reject) => {

                client.public((err, gists) => {

                    if (err) {
                        return reject(err);
                    }
                    return resolve(gists);
                });
            });
        })
        .then((gists) => {

            server.log(['gists', 'list'], `found ${gists.length} gists for user ${userId}`);
            return gists;
        });
};


