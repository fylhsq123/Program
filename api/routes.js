const Controllers = require('./controllers');
const Config = require('../config');

let controllers = new Controllers(Config.db.url);

let Routes = function (app) {
    app.route('/findSimile/:connectingWord')
        .get(controllers.findSimiles.bind(controllers));
    app.route('/files')
        .get(controllers.listFiles.bind(controllers));
    app.route('/zoonyms')
        .get(controllers.listZoonyms.bind(controllers))
        .post(controllers.addZoonym.bind(controllers))
        .put(controllers.editZoonym.bind(controllers))
        .delete(controllers.deleteZoonym.bind(controllers));
};
module.exports = Routes;