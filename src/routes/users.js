var jwt = require('jsonwebtoken');
var Admin = require('../models/admin');
var express = require('express');
var router = express.Router();
var authentication = require('./authentication');
var hash = require('password-hash');
var randomstring = require("randomstring");
var sendmail = require('sendmail')();

router.post('/auth', (req, res) => {
    Admin.findOne({
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
                u['_id'] = user._id;
                u['email'] = user.get('email');
                u['billingdate'] = user.get('billingdate');
                u['nextbillingdate'] = user.get('nextbillingdate');
                u['billingperiod'] = user.get('billingperiod');
                u['billingamount'] = user.get('billingamount');
                u['numberoftracks'] = user.get('numberoftracks');
                u['numberofpoints'] = user.get('numberofpoints');
                u['name'] = user.get('name');
                u['street'] = user.get('street');
                u['city'] = user.get('city');
                u['color'] = user.get('color');
                u['link'] = user.get('link');
                u['postal'] = user.get('postal');
                u['ico'] = user.get('ico');
                u['dic'] = user.get('dic');
                u['contactname'] = user.get('contactname');
                u['contactphone'] = user.get('contactphone');
                res.json(200, u);
            }
        }
    });
});

router.post('/resetpassword', (req, res) => {
    Admin.findOne({
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
                    from: 'rozumny@hotmail.com',
                    to: user.email,
                    subject: 'Mapy Manager - password reset',
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

router.get('/link/:id', (req, res) => {
    Admin.findOne({
        link: req.params.id
    }, function (err, user) {
        if (err) throw err;

        if (!user) {
            res.json(400, {});
        } else {
            var u = {};
            u['_id'] = user._id;
            u['color'] = user.get('color');
            u['name'] = user.get('name');
            u['username'] = user.get('username');
            res.json(200, u);
        }
    });
});

// Authenticated only
router.use('/', authentication);


router.route('/')
    .post((req, res) => {
        var user = new Admin(req.body);
        user.password = hashPassword(user.password);
        user.save((err) => {
            if (err)
                res.send(400, err);

            var u = {};
            u['token'] = jwt.sign(user, req.app.get('secret'));
            u['username'] = user.get('username');
            u['email'] = user.get('email');
            res.json(200, u);
        });
    })
    .get(function (req, res) {
        Admin.find(function (err, users) {
            if (err)
                res.send(err);
            res.json(users);
        });
    })
    .put(function (req, res) {
        Admin.findOne({
            email: req.body.email
        }, (err, user) => {
            if (err)
                res.send(err);

            user.set('username', req.body.username);
            user.set('email', req.body.email);
            user.set('billingdate', req.body.billingdate);
            user.set('billingamount', req.body.billingamount);
            user.set('nextbillingdate', req.body.nextbillingdate);
            user.set('billingperiod', req.body.billingperiod);
            user.set('numberoftracks', req.body.numberoftracks);
            user.set('numberofpoints', req.body.numberofpoints);
            user.set('name', req.body.name);
            user.set('street', req.body.street);
            user.set('city', req.body.city);
            user.set('postal', req.body.postal);
            user.set('ico', req.body.ico);
            user.set('dic', req.body.dic);
            user.set('link', req.body.link);
            user.set('color', req.body.color);
            user.set('contactname', req.body.contactname);
            user.set('contactphone', req.body.contactphone);

            var pwd = user.get('password');
            if (req.body.password && req.body.password != user.get('password')) {
                user.set('password', hashPassword(req.body.password));
            }

            user.save(function (err) {
                if (err)
                    res.send(400, err);

                res.json(200, user);
            });

        });
    });

router.route('/:user_id')
    .delete(function (req, res) {
        Admin.remove({
            _id: req.params.user_id
        }, function (err, bear) {
            if (err)
                res.send(400, err);

            res.json(200, { message: 'Successfully deleted' });
        });
    });

function hashPassword(password) {
    return hash.generate(password);
}

function verifyPassword(password, hashedPassword) {
    return hash.verify(password, hashedPassword);
}

module.exports = router;
