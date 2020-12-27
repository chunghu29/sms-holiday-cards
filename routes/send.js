// var sendEmail = require('../api/send-email')
var express = require('express');
var router = express.Router();

router.post('/', function(req, res) {
  console.log(req.body);
  //sendEmail();
  res.status(200).send();
});


module.exports = router;