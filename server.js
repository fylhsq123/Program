const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const app = express();
const config = require('./config');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.use(express.static(__dirname + '/web'));

app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname + '/index.html'));
})

app.listen(config.server.port, config.server.host, function () {
    console.log(`Server ${config.server.host} is listening on port ${config.server.port}`)
})