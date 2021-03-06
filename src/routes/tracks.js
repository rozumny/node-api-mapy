var File = require('../models/file');
var express = require('express');
var router = express.Router();
var fs = require('fs');
var path = require('path');
var https = require('https');
var Admin = require('../models/admin');

router.route('/gettracksbyowner/:owner_id')
    .get(function (req, res) {
        var key = req.params.owner_id;
        File.findOne({
            name: "tracks"
        }, function (err, file) {
            if (err) {
                res.send(err);
            } else {
                if (!file)
                    res.send({ value: undefined });
                else {
                    Admin.find(function (err, users) {
                        var user = users.find(user => user.get('username').toLowerCase() == key.toLowerCase());
                        if (!user)
                            res.send({ value: undefined });
                        else {
                            var data = file.get("value");
                            data = arrayToObject(objectToArrayStoreKeys(data).filter(track => {
                                return track.userId == user.get('id')
                            }));
                            data = arrayToObject(objectToArrayStoreKeys(data).map(t => {
                                // var track = [];
                                // var step = t.track.length < 10 ? 1 : 10;
                                // for (i = 0; i < t.track.length; i = i + step) {
                                //     track.push(t.track[i]);
                                // }

                                return {
                                    key: t.key,
                                    type: t.type,
                                    longitude: t.longitude,
                                    latitude: t.latitude,
                                    title: t.title,
                                    color: t.color,
                                    track: t.track
                                }
                            }));
                            res.send({ value: data });
                        }
                    });
                }
            }
        });
    });

router.route('/get')
    .get(function (req, res) {
        var key = req.params.owner_id;
        File.findOne({
            name: "tracks"
        }, function (err, file) {
            if (err) {
                res.send(err);
            } else {
                if (!file)
                    res.send({ value: undefined });
                else {
                    var data = file.get("value");
                    data = arrayToObject(objectToArrayStoreKeys(data).map(t => {
                        var track = [];
                        var step = t.track.length < 10 ? 1 : 10;
                        for (i = 0; i < t.track.length; i = i + step) {
                            track.push(t.track[i]);
                        }

                        return {
                            key: t.key,
                            type: t.type,
                            longitude: t.longitude,
                            latitude: t.latitude,
                            title: t.title,
                            track: track
                        }
                    }));
                    res.send({ value: data });
                }
            }
        });
    });


function objectToArrayStoreKeys(object) {
    var result = [];
    for (var a in object) {
        if (object.hasOwnProperty(a)) {
            object[a].key = a;
            result.push(object[a]);
        }
    }
    return result;
}

function arrayToObject(array) {
    var result = {};
    for (var i = 0; i < array.length; i++) {
        result[array[i].key] = array[i];
    }
    return result;
}

module.exports = router;