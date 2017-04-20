var jwt = require('jsonwebtoken');
var User = require('../models/user');
var express = require('express');
var router = express.Router();
var User = require('../models/user');
var authentication = require('./authentication');
var hash = require('password-hash');
var randomstring = require("randomstring");
var sendmail = require('sendmail')();

router.route('/')
    .post((req, res) => {
        var user = new User(req.body);
        user.password = hashPassword(user.password);
        user.save((err) => {
            if (err)
                res.send(400, err);

            var u = {};
            u['token'] = jwt.sign(user, req.app.get('secret'));
            u['username'] = user.get('username');
            u['email'] = user.get('email');
            u['sins'] = user.get('sins');
            u['total'] = user.get('total');
            u['public'] = user.get('public');
            res.json(200, u);
        });
    });
// router.route('/')
//     .get(function (req, res) {
//         User.find(function (err, users) {
//             if (err)
//                 res.send(err);
//             res.json(users);
//         });
//     });

router.post('/auth', (req, res) => {
    User.findOne({
        username: req.body.username
    }, (err, user) => {
        if (err) throw err;

        if (!user) {
            res.json(400, {});
        } else if (user) {
            if (!verifyPassword(req.body.password, user.get('password'))) {
                res.json(400, {});
            } else {
                var u = {};
                u['token'] = jwt.sign(user, req.app.get('secret'));
                u['username'] = user.get('username');
                u['email'] = user.get('email');
                u['sins'] = user.get('sins');
                u['total'] = user.get('total');
                u['public'] = user.get('public');
                res.json(200, u);
            }
        }
    });
});

router.post('/resetpassword', (req, res) => {
    User.findOne({
        name: req.body.name
    }, (err, user) => {
        if (err) throw err;

        if (!user) {
            res.json({ success: false, message: 'User not found.' });
        } else if (user) {
            var random = randomstring.generate({
                length: 20,
                charset: 'alphabetic'
            });
            user.password = hashPassword(random);

            user.save(function (err) {
                if (err)
                    res.send(err);

                sendmail({
                    from: 'no-reply@mysins.cz',
                    to: user.email,
                    subject: 'MySins - password reset',
                    html: 'Your password was reset. Please login using following password: ' + user.password,
                }, function (err, reply) {
                    console.log(err && err.stack);
                    console.dir(reply);
                    if (err)
                        res.json({ success: false, message: 'Sending email failed.' });
                    else
                        res.json({ success: true, message: 'Sending email success.' });
                });
            });
        }
    });
});

// Authenticated only
router.use('/', authentication);

router.route('/')
    // .get(function (req, res) {
    //     User.find(function (err, users) {
    //         if (err)
    //             res.send(err);
    //         res.json(users);
    //     });
    // })
    .put(function (req, res) {
        User.findOne({
            email: req.body.email
        }, (err, user) => {
            if (err)
                res.send(err);

            user.set('sins', req.body.sins);
            user.set('total', req.body.total);
            user.set('public', req.body.public);

            user.save(function (err) {
                if (err)
                    res.send(400, err);

                res.json(200, user);
            });

        });
    })
// .delete(function (req, res) {
//     User.remove({
//         _id: req.params.user_id
//     }, function (err, bear) {
//         if (err)
//             res.send(400, err);

//         res.json(200, { message: 'Successfully deleted' });
//     });
// })

// router.route('/:email')
//     .get(function (req, res) {
//         User.findOne({
//             email: req.body.email
//         }, (err, user) => {
//             if (err)
//                 res.send(400, err);
//             res.json(200, user);
//         });
//     });

function hashPassword(password) {
    return hash.generate(password);
}

function verifyPassword(password, hashedPassword) {
    return hash.verify(password, hashedPassword);
}

module.exports = router;
