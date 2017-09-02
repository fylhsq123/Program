const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const app = express();
const config = require('./config');
const Routes = require('./api/routes');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.use(express.static(__dirname + '/web'));

app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname + '/index.html'));
});

Routes(app);

// handle server errors
function clientErrorHandler (err, req, res, next) {
    res.status(500)
        .send({
            'success': false,
            'response': {
                'msg': err.msg || err.message
            }
        });
    next();
}
app.use(clientErrorHandler);

// handle requests with wrong address
app.use(function (req, res) {
    res.status(404)
        .send({
            url: '\'' + req.originalUrl + '\' not found'
        });
});


app.listen(config.server.port, config.server.host, function () {
    console.log(`Server ${config.server.host} is listening on port ${config.server.port}`);
});