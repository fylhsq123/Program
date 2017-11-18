const fs = require('fs');
const path = require('path');
const findInFiles = require('find-in-files');
const mongodb = require('mongodb');
class Controllers {
    constructor (db) {
        this.db = db;
        this.uploadPath = path.resolve(__dirname + '/../uploads');
    }

    static getPatterns (numLeft, numRight, zoonym = []) {
        var like = {
            similes: new RegExp(`(\\w+\\W+){0,${numLeft}}like(\\W+\\w+){1,${numRight}}`),
            zoonyms: zoonym ? new RegExp(`like.+\\b(${zoonym.join('|')})\\b|\\b(${zoonym.join('|')})-like`, 'gi') : null
        };
        var as = {
            similes: new RegExp(`(\\w+\\W+){0,${numLeft}}as(\\W+\\w+){1,5}\\W+as(\\W+\\w+){1,${numRight}}`),
            zoonyms: zoonym ? new RegExp(`\\bas\\b.+\\bas\\b.+\\b(${zoonym.join('|')})\\b`) : null
        };
        return {like, as};
    }

    static processSearch (filePath, fileName, patterns) {
        if (patterns) {
            return findInFiles.find({term: patterns.similes, flags: 'ig'}, filePath, fileName).then((result) => {
                var returnRes = [];
                for (let key in result) {
                    returnRes = result[key].matches;
                }
                if (patterns.zoonyms) {
                    returnRes = returnRes.filter((elem) => {
                        return patterns.zoonyms.test(elem);
                    });
                }
                return returnRes || [];
            });
        } else {
            throw new Error('Please, select connecting word');
        }
    }

    findSimiles (request, response, next) {
        var numLeft = parseInt(request.query.numLeft) || 5,
            numRight = parseInt(request.query.numRight) || 5,
            zoonym = request.query.zoonym || [],
            fileName = request.query.file,
            patterns = Controllers.getPatterns(numLeft, numRight, zoonym);
        if (fileName) {
            Controllers.processSearch(this.uploadPath, fileName, patterns[request.params.connectingWord]).then((result) => {
                response.status(200).send(result);
            }).catch((err) => {
                next(err);
            });
        } else {
            next(new Error('Please, select file to process'));
        }
    }

    /***** Listing text files *****/
    listFiles (request, response, next) {
        fs.readdir(this.uploadPath, (err, result) => {
            if (err) {
                next(err);
            } else {
                response.status(200).send(result);
            }
        });
    }

    /***** Managing zoonyms *****/
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