//From twilio sms grid
const util = require('util');
const multer = require('multer');
const addrs = require("email-addresses");
const sgMail = require('@sendgrid/mail');
const twilio = require('twilio');
const axios = require('axios');
const extractHtml = require('../utils/extract-html');

const MAX_TEXT_PAYLOAD = 1600;

var globalSettings;

logPayload = (msg, payload)=> {
    console.log(msg)
    const dest = process.env.LOG_PAYLOAD_DEST || ""

    if (dest == "") {
        console.debug(payload);
        return;
    }

    axios.post(dest, {msg, payload})
    .then(res=>console.log(`Post to ${dest} success`))
    .catch(error=>console.error(error));
}

module.exports = (req, res) => { 
    logPayload(`Starting client`, req.body)
    const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

    util.promisify(multer().any())(req, res)
    .then(res=>{
        console.log(`Multer complete`);
        const from = req.body.from;
        const to = req.body.to;
        const subject = req.body.subject;
        const body = extractHtml(req.body.html).slice(0, MAX_TEXT_PAYLOAD); //req.body.html; don't think we can send html in twilio
    
        //Using email-addresses library to extract email details.
        const toAddress = addrs.parseOneAddress(to);
        const toName = toAddress.local;
        const fromAddress = addrs.parseOneAddress(from);
        const fromName = fromAddress.local;

        logPayload(`Sending SMS`, {from, to, subject, body});
        //Sending SMS with Twilio Client
        client.messages.create({
            to: `+${toName}`,
            from: process.env.TWILIO_PHONE_NUMBER,
            body
        }).then(msg => {
            logPayload(`SMS Successfully Sent`, msg);
        }).catch(err => {
            logPayload(`SMS Failed to send`, err);
            //If we get an error when sending the SMS email the error message back to the sender
            sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    
            // Create Email
            const email = {
                to: fromAddress.address,
                from: toAddress.address,
                subject: `Error Sending SMS to ${toAddress.local}`,
                text: `${err}\n For email from ${fromAddress.address}`,
            };
            //Send Email
            sgResp = sgMail.send(email)
                .then(response => {
                    logPayload(`Fail Email Sent`, response);
                })
                .catch(error => {
                    logPayload(`Failed to send failed email`, error);
                });
        });
    });
    
    return;
};