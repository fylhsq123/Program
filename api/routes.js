const Controllers = require('./controllers');
const Config = require('../config');

let controllers = new Controllers(Config.db.url);

let Routes = function (app) {
    app.route('/findSimile/:connectingWord')
        .get(controllers.findSimiles);
};
module.exports = Routes;