var utils = require('../controllers/utils.server.controller'),
    logger = require('winston');

logger.info("Adding general utility routes");

module.exports = function(app) {
    app.all('/api/*', utils.applyContext);

    app.route('/api/ping')
        .get(utils.ping);
};
