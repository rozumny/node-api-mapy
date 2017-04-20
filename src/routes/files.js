var File = require('../models/file');
var express = require('express');
var router = express.Router();
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

router.route('/:file_id')
    .get(function (req, res) {
        File.findOne({
            name: req.params.file_id
        }, function (err, file) {
            if (err) {
                res.send(err);
            } else {
                if (!file)
                    res.send({ value: undefined });
                else
                    res.send(file);
            }
        });
    })
    .put(function (req, res) {
        File.findOne({
            name: req.params.file_id
        }, function (err, file) {
            if (err)
                res.send(err);

            if (!file) {
                req.body.name = req.params.file_id;
                file = new File(req.body);
            } else {
                file.set('value', req.body.value);
            }

            file.save(function (err) {
                if (err)
                    res.send(err);

                res.json({ message: 'File updated!' });
            });
        });
    })
    // .delete(function (req, res) {
    //     File.remove({
    //         _id: req.params.file_id
    //     }, function (err, bear) {
    //         if (err)
    //             res.send(err);

    //         res.json({ message: 'Successfully deleted' });
    //     });
    // })
    ;

module.exports = router;