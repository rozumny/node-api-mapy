var File = require('../models/file');
var express = require('express');
var router = express.Router();
var fs = require('fs');
var path = require('path');
var https = require('https');
var User = require('../models/user');

router.route('/getpointsbyowner/:owner_id')
    .get(function (req, res) {
        var key = req.params.owner_id;
        File.findOne({
            name: "points"
        }, function (err, file) {
            if (err) {
                res.send(err);
            } else {
                if (!file)
                    res.send({ value: undefined });
                else {
                    User.find(function (err, users) {
                        var user = users.find(user => user.get('username').toLowerCase() == key.toLowerCase());
                        if (!user)
                            res.send({ value: undefined });
                        else {
                            var data = file.get("value");
                            data = arrayToObject(objectToArrayStoreKeys(data).filter(point => {
                                return point.userId == user.get('id')
                            }));
                            res.send({ value: data });
                        }
                    });
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