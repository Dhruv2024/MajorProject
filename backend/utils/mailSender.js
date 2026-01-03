const nodemailer = require("nodemailer");

const mailSender = async (email, title, body) => {
    try {
        console.log("CREATING TRANSPORTER.... ")
        let transporter = nodemailer.createTransport({
            // host: process.env.MAIL_HOST,
            service:"gmail",
            auth: {
                user: process.env.MAIL_USER,
                pass: process.env.MAIL_PASS,
            }
        })

        console.log("Transporter created.... ")
        console.log(transporter)
        let info = await transporter.sendMail({
            from: 'EduSphere',
            to: `${email}`,
            subject: `${title}`,
            html: `${body}`,
        })
        console.log('Printing info.... ')
        console.log(info);
        return info;
    }
    catch (error) {
        console.log(error.message);
    }
}


module.exports = mailSender;