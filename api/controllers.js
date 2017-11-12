const fs = require('fs');
const path = require('path');
const findInFiles = require('find-in-files');
const mongodb = require('mongodb');
class Controllers {
    constructor (db) {
        this.db = db;
        this.likePattern = /(\w+\W+){10}like(\W+\w+){10}/;
        this.asAsPattern = /(\w+\W+){10}as(\W+\w+){1,5}\W+as(\W+\w+){10}/;
        this.uploadPath = path.resolve(__dirname + '/../uploads');
    }

    static processSearch (filePath, fileName, pattern, numLeft, numRight, zoonym = []) {
        return new Promise((resolve, reject) => {
            console.log({term: pattern, flags: 'ig'}, filePath, fileName);
            findInFiles.find({term: pattern, flags: 'ig'}, filePath, fileName).then((result) => {
                var returnRes = [];
                for (let key in result) {
                    returnRes = result[key].matches;
                }
                console.log(result);
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

    findSimiles (request, response, next) {
        var numLeft = parseInt(request.query.numLeft) || 5,
            numRight = parseInt(request.query.numRight) || 5,
            zoonym = request.query.zoonym || [],
            fileName = request.query.file;
        if (fileName) {
            Controllers.processSearch(this.uploadPath, fileName, this.likePattern, numLeft, numRight, zoonym).then((result) => {
                response.status(200).send(result);
            }).catch((err) => {
                next(err);
            });
        } else {
            next(new Error('Please, select file to process'));
        }
    }

    listFiles (request, response, next) {
        fs.readdir(this.uploadPath, (err, result) => {
            if (err) {
                next(err);
            } else {
                response.status(200).send(result);
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

    addZoonym (request, response, next) {
        mongodb.connect(this.db,(err, db) => {
            if (err) {
                next(err);
            } else {
                if (request.body.zoonym) {
                    db.collection('zoonyms').insert({zoonym: request.body.zoonym}, (error, result) => {
                        if (error) {
                            next(error);
                        } else {
                            response.status(200).send(result);
                        }
                    });
                } else {
                    response.status(400).send({message: 'Zoonym was not specified'});
                }
            }
        });
    }

    editZoonym (request, response, next) {
        mongodb.connect(this.db,(err, db) => {
            if (err) {
                next(err);
            } else {
                if (request.params.zoonymId) {
                    if (request.body.zoonym) {
                        db.collection('zoonyms').updateOne({_id: mongodb.ObjectID(request.params.zoonymId)}, {zoonym: request.body.zoonym}, (error, result) => {
                            if (error) {
                                next(error);
                            } else {
                                response.status(200).send(result);
                            }
                        });
                    } else {
                        response.status(400).send({message: 'Zoonym was not specified'});
                    }
                } else {
                    response.status(400).send({message: 'ZoonymId was not specified'});
                }
            }
        });
    }

    deleteZoonym (request, response, next) {
        mongodb.connect(this.db,(err, db) => {
            if (err) {
                next(err);
            } else {
                if (request.params.zoonymId) {
                    db.collection('zoonyms').deleteOne({_id: mongodb.ObjectID(request.params.zoonymId)}, (error, result) => {
                        if (error) {
                            next(error);
                        } else {
                            response.status(200).send(result);
                        }
                    });
                } else {
                    response.status(400).send({message: 'ZoonymId was not specified'});
                }
            }
        });
    }
}

module.exports = Controllers;