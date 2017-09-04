const fs = require('fs');
const path = require('path');
const findInFiles = require('find-in-files');
const mongodb = require('mongodb');
class Controllers {
    constructor (db) {
        this.db = db;
        this.likePattern = /(\w+\W+){5}like(\W+\w+){5}/;
        this.asAsPattern = /(\w+\W+){5}as(\W+\w+){1,5}\W+as(\W+\w+){5}/;
        this.uploadPath = path.resolve(__dirname + '/../uploads');
    }

    static processSearch (filePath, fileName, pattern, numLeft, numRight, zoonym = []) {
        return new Promise((resolve, reject) => {
            findInFiles.find({term: pattern, flags: 'ig'}, filePath, fileName).then((result) => {
                var returnRes = [];
                for (let key in result) {
                    returnRes = result[key].matches;
                }
                if (zoonym.length) {
                    let regexp = new RegExp('like.+\\b(' + zoonym.join('|') + ')\\b|\\b(' + zoonym.join('|') + ')-like', 'gi');
                    returnRes = returnRes.filter((elem) => {
                        return regexp.test(elem);
                    });
                }
                resolve(returnRes);
            }).catch((err) => {
                reject(err);
            });
        });
    }

    findSimiles (req, res, next) {
        var numLeft = parseInt(req.query.numLeft) || 5,
            numRight = parseInt(req.query.numRight) || 5,
            zoonym = req.query.zoonym || [],
            fileName = req.query.file;
        if (fileName) {
            Controllers.processSearch(this.uploadPath, fileName, this.likePattern, numLeft, numRight, zoonym).then((result) => {
                res.status(200).send(result);
            }).catch((err) => {
                next(err);
            });
        } else {
            next(new Error('Please, select file to process'));
        }
    }

    listFiles (req, res, next) {
        fs.readdir(this.uploadPath, (err, result) => {
            if (err) {
                next(err);
            } else {
                res.status(200).send(result);
            }
        });
    }

    listZoonyms (request, response, next) {
        mongodb.connect(this.db,(err, db) => {
            if (err) {
                next(err);
            } else {
                db.collection('zoonyms').find({}).toArray((error, result) => {
                    if (error) {
                        next(error);
                    } else {
                        response.status(200).send(result);
                    }
                });
            }
        });
    }

    addZoonym (req, res, next) {
        res.send({ok: 'OK'});
    }

    editZoonym (req, res, next) {
        res.send({ok: 'OK'});
    }

    deleteZoonym (req, res, next) {
        res.send({ok: 'OK'});
    }
}

module.exports = Controllers;