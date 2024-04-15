const nodemailer = require("nodemailer");
require("dotenv").config();
module.exports = async ({ from, to, subject, text, html }) => {
    console.log("App PAss:", process.env.APP_PASS);
    let transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER, // generated ethereal user
        pass: process.env.GMAIL_PASS, // generated ethereal password
      },
      tls: {
        rejectUnAuthorized: false,
      },
    });

    // send mail with defined transport object
    let info = await transporter.sendMail({
        from: `inShare <${from}>`, // sender address
        to: to, // list of receivers
        subject: subject, // Subject line
        text: text, // plain text body
        html: html, // html body
    });
}