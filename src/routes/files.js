var File = require('./models/file');
var express = require('express');
var router = express.Router();

router.route('/file')
    .post(function (req, res) {
        var file = new File(req.body);
        file.save(function (err) {
            if (err)
                res.send(err);

            res.json({ message: 'Data created!' });
        });
    })
    .get(function (req, res) {
        File.find(function (err, files) {
            if (err)
                res.send(err);

            res.json(files);
        });
    });

router.route('/files/:file_id')
    .get(function (req, res) {
        File.findById(req.params.file_id, function (err, user) {
            if (err)
                res.send(err);
            res.json(user);
        });
    })
    .put(function (req, res) {
        File.findById(req.params.file_id, function (err, file) {

            if (err)
                res.send(err);

            file.name = req.body.name;
            file.save(function (err) {
                if (err)
                    res.send(err);

                res.json({ message: 'File updated!' });
            });

        });
    })
    .delete(function (req, res) {
        File.remove({
            _id: req.params.user_id
        }, function (err, bear) {
            if (err)
                res.send(err);

            res.json({ message: 'Successfully deleted' });
        });
    });

module.exports = router;