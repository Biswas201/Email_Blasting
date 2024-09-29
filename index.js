const express = require("express");
const router = express.Router();
const serverless = require("serverless-http");
const path = require("path");
const dotenv = require("dotenv");
const crypto = require('crypto');
const nodemailer = require('nodemailer');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.urlencoded({ extended: true }));

// Serve static files (CSS, JS)
app.use(express.static(path.join(__dirname, "public")));

// Serve mail page after successful login
app.get("/mail", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "mail.html"));
});

// Serve mail page after successful login
app.get("/mail", (req, res) => {
  res.sendFile(path.join(__dirname, "mail.html"));
});

// Handle email sending logic
app.post("/send-emails", (req, res) => {
  const {
    smtpServer,
    senderEmail,
    appPassword,
    recipients,
    subjectTemplate,
    bodyTemplate,
  } = req.body;

  //randomLetter logic
  function generateRandomLetters(length) {
    let result = "";
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const charactersLength = characters.length;

    for (let i = 0; i < length; i++) {
      result += String.fromCharCode(65 + Math.floor(Math.random() * 26));
    }

    return result;
  }

  const recipientList = recipients.split(",");

  recipientList.forEach((recipient) => {
    const randomInvoice = `INV-${Math.floor(Math.random() * 100000)}`;
    const randomNumber = Math.floor(Math.random() * 10000);
    const randomLetter = generateRandomLetters(10);

    const emailSubject = subjectTemplate
      .replace("#invoice", randomInvoice)
      .replace("#number", randomNumber)
      .replace("#letter", randomLetter);

    const emailBody = bodyTemplate
      .replace("#invoice", randomInvoice)
      .replace("#number", randomNumber)
      .replace("#letter", randomLetter);

    sendEmail(
      smtpServer,
      senderEmail,
      appPassword,
      recipient,
      emailSubject,
      emailBody
    );
  });

  res.sendFile(path.join(__dirname, "public", "sendmail-success.html"));
});

// send email
function sendEmail(
  smtpServer,
  senderEmail,
  appPassword,
  recipient,
  subject,
  body
) {
  let transportOptions = {};

  switch (smtpServer) {
    case "smtp.gmail.com":
      transportOptions = {
        host: smtpServer || process.env.SMTP_SERVER,
        port: 465,
        secure: true,
        auth: {
          user: senderEmail || process.env.SENDER_EMAIL,
          pass: appPassword || process.env.APP_PASSWORD,
        },
      };
      break;
    case "smtp.mail.yahoo.com":
      transportOptions = {
        host: smtpServer || process.env.SMTP_SERVER_2,
        port: 465,
        secure: true,
        auth: {
          user: senderEmail || process.env.SENDER_EMAIL_2,
          pass: appPassword || process.env.APP_PASSWORD_2,
        },
      };
      break;
    case "smtp.outlook.com":
      transportOptions = {
        host: smtpServer || process.env.SMTP_SERVER_3,
        port: 587,
        secure: false,
        auth: {
          user: senderEmail || process.env.SENDER_EMAIL_3,
          pass: appPassword || process.env.APP_PASSWORD_3,
        },
      };
      break;
    default:
      return console.log("Unsupported SMTP server");
  }

  let transporter = nodemailer.createTransport(transportOptions);

  let mailOptions = {
    from: senderEmail || process.env.SENDER_EMAIL,
    to: recipient,
    subject: subject,
    html: body,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log(error);
    } else {
      console.log("Message sent: %s", info.messageId);
    }
  });
}

// router.get("/", (req, res) => {
//   res.send("App is running..");
// });

// app.use("/.netlify/server", router);
// module.exports.handler = serverless(app);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
