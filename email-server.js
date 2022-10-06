
const sendVerification = (email, key) => {
    // let Transport = nodemailer.createTransport({
    //     host: "209.94.56.64",
    //     port: 25,
    //     sendmail: true,
    //     newline: 'unix',
    //     path: '/usr/sbin/sendmail',
    // });

    // let mailOptions = {
    //     from: '"RushHour" <rushhour@cse356wp2.com>', 
    //     to: email, 
    //     subject: "Account Verification",
    //     text: "Please click the link below to verify your account",
    //     html: `<a>href=\"http://209.94.56.64/ttt/verify/?email=${email}&key=${key}\" </a>`, 
    // };  

    // Transport.sendMail(mailOptions, (error, info) => {
    //     if (error) {
    //         console.log(error);
    //     } else {
    //         console.log("Verification email sent!");
    //         console.log('Message %s sent: %s', info.messageId, info.response);
    //     }
    // });
    
};

module.exports = sendVerification;