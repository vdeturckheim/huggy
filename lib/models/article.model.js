'use strict';
const Mongoose = require('mongoose');
const Schema = Mongoose.Schema;
// TODO (later): publication date
const articleSchema = Schema({
    title: {
        type: String,
        required: true
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    published: {
        type: Boolean,
        default: false,
        required: true
    },
    gistId: {
        type: String,
        required: true
    }
});

module.exports = Mongoose.model('Article', articleSchema);
