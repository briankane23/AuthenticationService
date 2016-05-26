var utils = require('../controllers/utils.server.controller'),
    logger = require('winston');

logger.info("Adding general utility routes");

module.exports = function(app) {
    app.all('/api/*', utils.applyContext);

    app.route('/api/ping')
        .get(utils.ping);

    app.route('/api/killToken')
        .get(utils.killToken);

    app.route('/api/currentTokens')
        .get(utils.getTokens);

    app.route('/api/testValidation')
        .get(utils.authenticate, utils.testValidation);
};
