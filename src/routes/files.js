var File = require('../models/file');
var express = require('express');
var router = express.Router();
var formidable = require('formidable');
var fs = require('fs');
var path = require('path');
// var authentication = require('./authentication');


// router.route('/')
//     .post(function (req, res) {
//         var file = new File(req.body);
//         file.save(function (err) {
//             if (err)
//                 res.send(err);

//             res.json({ message: 'Data created!' });
//         });
//     })
//     .get(function (req, res) {
//         File.findOne({
//             name: req.params.name
//         }, (err, user) => {
//             if (err)
//                 res.send(err);

//             res.json(files);
//         });
//     });

router.route('/upload')
    .post(function (req, res) {
        var form = new formidable.IncomingForm();

        form.uploadDir = path.join(__dirname, '../../public');
        form.keepExtensions = true;

        var fileName;
        form.on('file', function (field, file) {
            fileName = path.basename(file.path);
        });

        form.on('error', function (err) {
            res.json({ success: false });
        });

        form.on('end', function () {
            res.json({ success: true, name: fileName });
        });

        form.parse(req);
    })
router.route('/upload/:file_id')
    .delete(function (req, res) {
        var uploadDir = path.join(__dirname, '../../public');
        var fileName = req.params.file_id;
        var p = path.join(uploadDir, fileName);
        if (fs.existsSync(p))
            fs.unlink(p);
        res.json({ success: true });
    });
router.route('/:file_id')
    .get(function (req, res) {
        var key = req.params.file_id;
        var keyArray = key.split('.');
        if (!key || keyArray.length == 0)
            res.status(500).send('Error');
        File.findOne({
            name: keyArray[0]
        }, function (err, file) {
            if (err) {
                res.send(err);
            } else {
                if (!file)
                    res.send({ value: undefined });
                else {
                    var data = file.get("value");
                    if (keyArray.length == 1)
                        res.send({ value: data });
                    else {
                        keyArray.splice(0, 1);
                        var result = getNested(data, keyArray.join('.'))
                        res.send({ value: result });
                    }
                }
            }
        });
    })
    .put(function (req, res) {
        var key = req.params.file_id;
        var keyArray = key.split('.');
        if (!key || keyArray.length == 0)
            res.status(500).send('Error');

        File.findOne({
            name: keyArray[0]
        }, function (err, file) {
            if (err)
                res.send(err);

            if (!file) {
                req.body.name = keyArray[0];
                file = new File(req.body);
            } else {
                if (keyArray.length == 1)
                    file.set('value', req.body.value);
                else {
                    var data = file.get('value');
                    keyArray.splice(0, 1);
                    var dataKey = keyArray.join('.')
                    setNested(data, dataKey, req.body.value);
                    file.set('value', data);
                    file.markModified('value')
                }
            }

            file.save(function (err) {
                if (err)
                    res.send(err);

                res.json({ message: 'File updated!' });
            });
        });
    })
    .delete(function (req, res) {
        var key = req.params.file_id;
        var keyArray = key.split('.');
        if (!key || keyArray.length == 0)
            res.status(500).send('Error');

        if (keyArray.length == 1) {
            File.remove({
                _id: req.params.file_id
            }, function (err, bear) {
                if (err)
                    res.send(err);

                res.json({ message: 'Key deleted' });
            });
        } else {
            File.findOne({
                name: keyArray[0]
            }, function (err, file) {
                if (err)
                    res.send(err);

                if (!file) {
                    res.json({ message: 'Nothing to delete' });
                } else {
                    var data = file.get('value');
                    keyArray.splice(0, 1);
                    var lastKey = keyArray[keyArray.length - 1];
                    keyArray.splice(-1, 1);
                    var dataKey = keyArray.join('.')
                    var a = getNested(data, dataKey);
                    if (a && a[lastKey]) {
                        delete a[lastKey];
                    }
                    file.set('value', data);
                    file.markModified('value')
                }

                file.save(function (err) {
                    if (err)
                        res.send(err);

                    res.json({ message: 'Property deleted!' });
                });
            });
        }
    });

function getNested(obj, path) {
    if (path.length === 0) {
        return obj;
    }
    return path
        ? path.split('.')
            .reduce((prev, curr) => {
                return prev ? prev[curr] : null;
            }, obj || this)
        : null;
}

function getFieldName(path) {
    var pathArray = path.split('.');
    return path.split('.')[pathArray.length - 1];
}

function setNested(object, path, value) {
    if (path.length === 0) {
        object = value;
    }
    var arrayPath = path.split('.');
    var tmp = object;
    var field = getFieldName(path);
    arrayPath.splice(arrayPath.length - 1);
    arrayPath.forEach(x => {
        if (tmp[x] === undefined || tmp[x] === null) {
            tmp[x] = {};
        }
        tmp = tmp[x];
    });

    tmp[field] = value;
}

module.exports = router;