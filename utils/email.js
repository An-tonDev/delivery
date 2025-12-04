const nodemailer = require('nodemailer');

class Email {
  constructor(user, url) {
    this.to = user.email;
    this.name = user.username;
    this.url = url;
    this.from = `Delivery App <${process.env.EMAIL_FROM}>`;
  }

  newTransport() {
    if (process.env.NODE_ENV === 'production') {
      return nodemailer.createTransport({
        service: 'SendGrid',
        auth: {
          user: process.env.SENDGRID_USERNAME,
          pass: process.env.SENDGRID_PASSWORD
        }
      });
    }

    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD
      }
    });
  }

  async sendEmail(template, subject) {
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html: template,
      text: template.replace(/<[^>]*>/g, '') 
    };

    await this.newTransport().sendMail(mailOptions);
  }

  
  async sendWelcome() {
    const message = `
      <h1>Welcome ${this.name}!</h1>
      <p>Your account has been successfully created.</p>
    `;
    await this.sendEmail(message, "Welcome to Delivery App!");
  }

  async sendPasswordReset(resetToken) {
    const message = `
      <p>Hello ${this.name},</p>
      <p>You requested a password reset.</p>
      <p>Reset your password here: <a href="${this.url}">${this.url}</a></p>
      <p>This token expires in 10 minutes.</p>
    `;
    await this.sendEmail(message, "Your password reset token (valid for 10 mins)");
  }
}

module.exports = Email;
