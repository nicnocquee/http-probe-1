import Mail from 'nodemailer/lib/mailer'

export default class SmtpMail {
  transporter: Mail | undefined

  constructor(transport: Mail | undefined) {
    this.transporter = transport
  }

  async send(from: string, to: string, subject: string, body: string) {
    return this.transporter?.sendMail({
      from,
      to,
      subject,
      html: body,
    })
  }
}
