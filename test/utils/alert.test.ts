import chai, { expect } from 'chai'
import spies from 'chai-spies'
import { MailgunData } from '../../src/interfaces/data'

chai.use(spies)

import { SymonResponse } from '../../src/interfaces/response'
import {
  parseAlertStringTime,
  responseTimeGreaterThan,
  sendAlerts,
  statusNot2xx,
  validateResponse,
} from '../../src/utils/alert'
import * as mailgun from '../../src/utils/mailgun'
import * as webhook from '../../src/utils/webhook'
import * as smtp from '../../src/utils/smtp'

describe('check response status', () => {
  it('should trigger alert when response is within 4xx status', () => {
    const status400Alert = statusNot2xx({ status: 400 } as SymonResponse)
    expect(status400Alert).to.be.true
    const status401Alert = statusNot2xx({ status: 401 } as SymonResponse)
    expect(status401Alert).to.be.true
    const status403Alert = statusNot2xx({ status: 403 } as SymonResponse)
    expect(status403Alert).to.be.true
    const status404Alert = statusNot2xx({ status: 404 } as SymonResponse)
    expect(status404Alert).to.be.true
    const status405Alert = statusNot2xx({ status: 405 } as SymonResponse)
    expect(status405Alert).to.be.true
  })
  it('should trigger alert when response is within 5xx status', () => {
    const status500Alert = statusNot2xx({ status: 500 } as SymonResponse)
    expect(status500Alert).to.be.true
    const status501Alert = statusNot2xx({ status: 501 } as SymonResponse)
    expect(status501Alert).to.be.true
    const status502Alert = statusNot2xx({ status: 502 } as SymonResponse)
    expect(status502Alert).to.be.true
    const status503Alert = statusNot2xx({ status: 503 } as SymonResponse)
    expect(status503Alert).to.be.true
  })
  it('should not trigger alert when response is within 2xx status', () => {
    const status200Alert = statusNot2xx({ status: 200 } as SymonResponse)
    expect(status200Alert).to.be.false
    const status201Alert = statusNot2xx({ status: 201 } as SymonResponse)
    expect(status201Alert).to.be.false
    const status202Alert = statusNot2xx({ status: 202 } as SymonResponse)
    expect(status202Alert).to.be.false
    const status204Alert = statusNot2xx({ status: 204 } as SymonResponse)
    expect(status204Alert).to.be.false
  })
})

describe('parse alert string and get time in milliseconds', () => {
  it('should throw error when no number found', () => {
    expect(
      parseAlertStringTime.bind(null, 'response-time-greater-than-now')
    ).to.throw()
  })
  it('should throw error when pattern is invalid', () => {
    expect(
      parseAlertStringTime.bind(null, 'response-time-greater-than-200-s')
    ).to.throw()
  })
  it('should parse string `response-time-greater-than-2s`', () => {
    const time = parseAlertStringTime('response-time-greater-than-2s')
    expect(time).to.equals(2000)
  })
  it('should parse string `response-time-greater-than-300ms`', () => {
    const time = parseAlertStringTime('response-time-greater-than-300ms')
    expect(time).to.equals(300)
  })
})

describe('check time to response', () => {
  it('should trigger alert when response time is greater than specified value', () => {
    const alert = responseTimeGreaterThan(200)({
      timeToResponse: 300,
    } as SymonResponse)
    expect(alert).to.be.true
  })
  it('should not trigger alert when response time equals to specified value', () => {
    const alert = responseTimeGreaterThan(200)({
      timeToResponse: 200,
    } as SymonResponse)
    expect(alert).to.be.false
  })
  it('should not trigger alert when response is less than to specified value', () => {
    const alert = responseTimeGreaterThan(200)({
      timeToResponse: 100,
    } as SymonResponse)
    expect(alert).to.be.false
  })
})

describe('check response against list of alerts', () => {
  it('should ignore unknown alert string', () => {
    const alerts = validateResponse(['unknown'], {} as SymonResponse)
    expect(alerts).to.have.length(0)
  })
  it('should recognize known alert strings', () => {
    const alerts = validateResponse(
      ['status-not-2xx', 'response-time-greater-than-200ms'],
      {} as SymonResponse
    )
    expect(alerts).to.have.length(2)
  })
  it('should not trigger any alert when no alert condition is true', () => {
    const alerts = validateResponse(
      ['status-not-2xx', 'response-time-greater-than-200ms'],
      {
        timeToResponse: 100,
        status: 200,
      } as SymonResponse
    ).filter(({ status }) => status === true)
    expect(alerts).to.have.length(0)
  })
  it('should trigger one alert when one alert condition is true', () => {
    const alerts = validateResponse(
      ['status-not-2xx', 'response-time-greater-than-200ms'],
      {
        timeToResponse: 100,
        status: 400,
      } as SymonResponse
    ).filter(({ status }) => status === true)
    expect(alerts).to.have.length(1)
  })
  it('should trigger more than one alert when more than one alert condition is true', () => {
    const alerts = validateResponse(
      ['status-not-2xx', 'response-time-greater-than-200ms'],
      {
        timeToResponse: 300,
        status: 400,
      } as SymonResponse
    ).filter(({ status }) => status === true)
    expect(alerts).to.have.length(2)
  })
})

describe('send alerts', () => {
  afterEach(() => {
    chai.spy.restore()
  })
  it('should not send any alert', async () => {
    const sent = await sendAlerts({
      validations: [
        {
          alert: 'status-not-2xx',
          status: false,
        },
      ],
      notifications: [
        {
          id: 'one',
          type: 'mailgun',
          recipients: ['xx@xx'],
          data: {
            apiKey: 'xx',
            domain: 'xxx',
          } as MailgunData,
        },
      ],
      url: 'https://hyperjump.tech',
    })
    expect(sent).to.have.length(0)
  })
  it('should send mailgun notification', async () => {
    chai.spy.on(mailgun, 'sendMailgun', () => Promise.resolve())
    const sent = await sendAlerts({
      validations: [
        {
          alert: 'status-not-2xx',
          status: true,
        },
      ],
      notifications: [
        {
          id: 'one',
          type: 'mailgun',
          recipients: ['xx@xx'],
          data: {
            recipients: ['xx@xx'],
            apiKey: 'xx',
            domain: 'xxx',
          },
        },
      ],
      url: 'https://hyperjump.tech',
    })
    expect(mailgun.sendMailgun).to.have.been.called()
    expect(sent).to.have.length(1)
  })
  it('should send webhook notification', async () => {
    chai.spy.on(webhook, 'sendWebhook', () => Promise.resolve())
    const sent = await sendAlerts({
      validations: [
        {
          alert: 'status-not-2xx',
          status: true,
        },
      ],
      notifications: [
        {
          id: 'one',
          type: 'webhook',
          recipients: ['xx@xx'],
          data: {
            url: 'xx',
            method: 'POST',
          },
        },
      ],
      url: 'https://hyperjump.tech',
    })
    expect(webhook.sendWebhook).to.have.been.called()
    expect(sent).to.have.length(1)
  })
  it('should send SMTP notification', async () => {
    chai.spy.on(smtp, 'sendSmtpMail', () => Promise.resolve())
    const sent = await sendAlerts({
      validations: [
        {
          alert: 'status-not-2xx',
          status: true,
        },
      ],
      notifications: [
        {
          id: 'one',
          type: 'smtp',
          recipients: ['xx@xx'],
          data: {
            recipients: ['xx@xx'],
            hostname: 'xx',
            port: 100,
            username: 'xxx',
            password: 'xxxx',
          },
        },
      ],
      url: 'https://hyperjump.tech',
    })
    expect(smtp.sendSmtpMail).to.have.been.called()
    expect(sent).to.have.length(1)
  })
  it('should send both alerts', async () => {
    chai.spy.on(webhook, 'sendWebhook', () => Promise.resolve())
    const sent = await sendAlerts({
      validations: [
        {
          alert: 'status-not-2xx',
          status: true,
        },
        {
          alert: 'response-time-greater-than-200-ms',
          status: true,
        },
      ],
      notifications: [
        {
          id: 'one',
          type: 'webhook',
          recipients: ['xx@xx'],
          data: {
            url: 'xx',
            method: 'POST',
          },
        },
      ],
      url: 'https://hyperjump.tech',
    })
    expect(webhook.sendWebhook).to.have.been.called()
    expect(sent).to.have.length(2)
  })
})
