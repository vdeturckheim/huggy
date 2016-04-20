'use strict';
const Octonode = require('octonode');

const wrap = function (func) {

    return new Promise((resolve, reject) => {

        func((err, response) => {

            if (err) {
                return reject(err);
            }
            return resolve(response);
        });
    });
};

class Github {

    constructor(clientToken) {

        this.client = Octonode.client(clientToken);
        this.gistClient = this.client.gist();
    }

    get gists() {

        return wrap(this.gistClient.public);
    }

    getGist(gistId) {

        return wrap((cb) => this.gistClient.get(gistId, cb));
    }
}

module.exports = Github;
