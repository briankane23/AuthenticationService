var error = require('../controllers/error.server.controller'),
    logger = require('winston');

logger.info("Adding errorHandler routes");

module.exports = function(app) {
    app.all('/api/*', error.attachHandler);
};
