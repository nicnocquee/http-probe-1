import { expect } from '@oclif/test'
import Smtp from '../../src/utils/smtp'
import Mail from 'nodemailer/lib/mailer'

const mailMock = require('nodemailer-mock')

const transport: Mail = mailMock.createTransport({
  host: '127.0.0.1',
  port: 2323,
})
const opt: Mail.Options = {
  from: 'me@mail.com',
  to: 'symontest@mailinator.com',
  subject: 'unit test',
  html: '<p>A unit test</p>',
}

describe('Smtp test', () => {
  it('should return success info', async function () {
    transport.sendMail(opt, function () {
      return {
        accepted: ['successEmail'],
      }
    })

    const email = new Smtp(transport)

    const res = await email.send(
      'me@mail.com',
      'symontest@mailinator.com',
      'unit test',
      '<p>A unit test</p>'
    )

    expect(res.accepted).length(1)
  })

  it('should return undefined', async function () {
    const email = new Smtp(undefined)
    const res = await email.send(
      'me@mail.com',
      'symontest@mailinator.com',
      'unit test',
      '<p>A unit test</p>'
    )

    expect(res).undefined
  })
})
