/*
 Routing file for users.

 Implements:
 -Users Controller (app/controllers/users.server.controller.js)

 Implemented By:
 - Express Config (config/express.js)
 */

var users = require('../controllers/authentication.server.controller'),
    passport = require('passport'),
    logger = require('winston');

logger.info("Setting Authentication Routes");

module.exports = function(app) {
    app.param('userId', users.userById);

    app.route('/api/users')
        .post(users.create)
        .get(users.list);

    app.route('/api/users/:userId')
        .get(users.read)
        .put(users.update)
        .delete(users.delete);

    app.route('/api/authenticate')
        .post(passport.authenticate('local'), users.authenticate);

    app.route('/api/validate')
        .post(users.validate);

    app.route('/api/unauthenticate')
        .get(users.unauthenticate);

    app.route('/api/servicesByToken')
        .get(users.servicesByToken);

    app.get('/signout', users.signout);
};
