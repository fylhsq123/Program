const fs = require('fs');
class Controllers {
    constructor (db) {
        this.db = db;
        this.likePatern = /(\w+\W+){5}odio(\W+\w+){5}/gi;
        this.asAsPatern = /(\w+\W+){5}as(\W+\w+){1,5}\W+as(\W+\w+){5}/gi;
    }

    static processSearch (file, word, numLeft, numRight, zoonym = '') {
    }

    findSimiles (req, res) {
        var numLeft = parseInt(req.query.numLeft) || 5,
            numRight = parseInt(req.query.numRight) || 5,
            zoonym = req.query.zoonym || '';
        res.status(200).send({reseived: {connectingWord: req.params.connectingWord, numLeft, numRight, zoonym}});
    }
}

module.exports = Controllers;