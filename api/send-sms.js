//From twilio sms grid
const util = require('util');
const multer = require('multer');
const addrs = require("email-addresses");
const sgMail = require('@sendgrid/mail');
const twilio = require('twilio');
const axios = require('axios');

logPayload = (msg, payload)=> {
    console.log(msg)
    const dest = process.env.LOG_PAYLOAD_DEST || ""
    axios.post(dest, {msg, payload})
    .then(res=>console.log(`Post to ${dest} success`))
    .catch(error=>console.error(error));
}

module.exports = async (req, res) => { 
    logPayload(`Starting client`, req.body)
    const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

    process = util.promisify(multer().any())(req, res);
    process.then(()=>{
        console.log(`Multer complete`);
        const from = req.body.from;
        const to = req.body.to;
        const subject = req.body.subject;
        const body = req.body.text; //req.body.html; don't think we can send html in twilio
    
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
            res.status(200).send(msg.sid);
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
                    res.status(200).send("Sent Error Email");
                })
                .catch(error => {
                    logPayload(`Failed to send faile email`, error);
                    res.status(500);
                });
        });
    });
    
    res.status(200).send();
};