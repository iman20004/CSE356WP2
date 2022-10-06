const nodemailer = require("nodemailer")

const sendVerification = (email, key) => {
    var Transport = nodemailer.createTransport({
        host: "209.151.155.22",
        port: 25
    })

    var mailconfig;
    mailconfig = {
        from: '"RushHour" rushhour@cse356.com>', 
        to: email, 
        subject: "Account Verification",
        text: "Please click the link below to verify your account",
        html: `<a>href=\"http://209.151.155.22/ttt/verify/?email=${email}&key=${key}\" </a>`, 
    };  

    Transport.sendMail(mailconfig, function(error, response) {
        if (error) {
            console.log(error);
        } else {
            console.log("Verification email sent!");
        }
    });
}