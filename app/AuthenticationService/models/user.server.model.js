/*
 User Model for login functionality.

 Implementedd By:
 - Mongoose config file (config/mongoose.js)
 */

var mongoose = require('mongoose'),
    crypto = require('crypto'),
    Schema = mongoose.Schema,
    logger = require('winston');

logger.info("Adding User Model");

var UserSchema = new Schema({
    username: {
        type: String,
        trim: true,
        unique: true,
        required: "A username is required to create an account."
    },

    email: {
        type: String,
        index: true,
        required: "You must supply a valid email address.",
        match: /.+\@.+\..+/
    },

    role: {
        type: String,
        enum: ['Admin', 'User'],
        default: 'User'
    },

    password: {
        type: String,
        validate: [
            function(password) {
                return password.length >= 8;
            }, "Password must be at least 8 characters."
        ],
        required: "You must supply a password."
    },

    salt: {
        type: String,
    },

    firstName: {
        type: String,
        validate: [
            function(firstName) {
                return firstName.length <= 15;
            }, "First name is too long."
        ]
    },

    lastName: {
        type: String,
        validate: [
            function(lastName) {
                return lastName.length <=20;
            }, "Last name is too long."
        ]
    },

    created: {
        type: Date,
        default: Date.now
    },

    modified: [{
        type: Date
    }]
});

UserSchema.virtual('fullName').get(function() {
    return this.firstName + ' ' + this.lastName;
});

UserSchema.pre('save', function(next) {
    //hash and salt the password
    if(this.password) {
        this.salt = new Buffer(crypto.randomBytes(16).toString('base64'), 'base64');
        this.password = this.hashPassword(this.password);
    }

    next();
});

//method to hash the password
UserSchema.methods.hashPassword = function(password) {
    return crypto.pbkdf2Sync(password, this.salt, 10000, 64).toString('base64');
};

//authenticate the password against the hash
UserSchema.methods.authenticate = function(password) {
    return this.password === this.hashPassword(password);
};

//this is mostly for oAuth which we likely won't use
UserSchema.statics.findUniqueUsername = function(username, suffix, callback) {
    var _this = this;
    var possibleUsername = username + (suffix || '');

    _this.findOne({
        username: possibleUsername
    }, function(err, user) {
        if(!err) {
            if(!user) {
                callback(possibleUsername);
            } else {
                return _this.findUniqueUsername(username, (suffix || 0) + 1, callback);
            }
        } else {
            callback(null);
        }
    });
};

UserSchema.pre('save', function(next) {
    this.modified.unshift(Date.now());
    next();
});

UserSchema.set('toJSON', { getters: true, virtuals: true });
mongoose.model('User', UserSchema);


