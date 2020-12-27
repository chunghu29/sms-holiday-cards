var sendSMS = require('../api/send-sms');
var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

/* POST inbound mail parse.jessehu.tech */
router.post('/', function(req, res) {
  console.log(req.body);
  sendSMS(req, res);
  res.status(200).send();
});

module.exports = router;
