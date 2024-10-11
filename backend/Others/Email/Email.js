const nodemailer = require('nodemailer');

class Email {
    constructor() {
        // Create a transporter using Gmail
        this.transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: "moses_lee@ecss.org.sg", // Your email address
                pass: "Mlxy@9566", // Your app password or normal password
            },
            tls: {
                rejectUnauthorized: false, // Allow self-signed certificates
            }
        });
    }

    // Method to send an email
    sendEmailToReceipent(to, subject, text) {
        console.log(to);
        const mailOptions = {
            from: this.transporter.options.auth.user, // From address is the user's email
            to: to, // Recipient email address
            subject: subject, // Email subject
            html: text, // Email body
        };

        this.transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                return console.log(`Error sending email: ${error}`);
            }
            console.log(`Email sent: ${info.response}`);
        });
    }
}

module.exports = Email;
