import { SMTPData, WebhookData } from '../interfaces/data'
import { Notification } from '../interfaces/notification'
import { Probe } from '../interfaces/probe'
import { SymonResponse } from '../interfaces/response'
import getIp from './ip'
import { sendMailgun } from './mailgun'
import { createSmtpTransport, sendSmtpMail } from './smtp'
import { sendWebhook } from './webhook'

type CheckResponseFn = (response: SymonResponse) => boolean
type ValidateResponseStatus = { alert: string; status: boolean }

// Check if response status is not 2xx
export const statusNot2xx: CheckResponseFn = (response) =>
  response.status < 200 || response.status >= 300

// Check if response time is greater than specified value in milliseconds
export const responseTimeGreaterThan: (
  minimumTime: number
) => CheckResponseFn = (minimumTime) => (response: SymonResponse): boolean =>
  response.timeToResponse > minimumTime

// parse string like "response-time-greater-than-200ms" and return the time in ms
export const parseAlertStringTime = (str: string): number => {
  // match any string that ends with digits followed by unit 's' or 'ms'
  const match = str.match(/(\d+)(m?s)$/)
  if (!match) {
    throw new Error('alert string does not contain valid time number')
  }

  const number = Number(match[1])
  const unit = match[2]

  if (unit === 's') return number * 1000
  return number
}

const getCheckResponseFn = (alert: string): CheckResponseFn | undefined => {
  if (alert === 'status-not-2xx') {
    return statusNot2xx
  }
  if (alert.startsWith('response-time-greater-than-')) {
    const alertTime = parseAlertStringTime(alert)
    return responseTimeGreaterThan(alertTime)
  }
}

export const validateResponse = (
  alerts: Probe['alerts'],
  response: SymonResponse
): ValidateResponseStatus[] => {
  const checks = []

  for (const alert of alerts) {
    const checkFn = getCheckResponseFn(alert.toLowerCase())
    if (checkFn) {
      checks.push({
        alert,
        status: checkFn(response),
      })
    }
  }

  return checks
}

export const getMessageForAlert = (
  alert: string,
  url: string,
  ipAddress: string
): {
  subject: string
  body: string
} => {
  const message = {
    subject: alert,
    body: `
      Time: ${Date.now()}\n
      Target URL: ${url}\n
      From server: ${ipAddress}
    `,
  }

  return message
}

export const sendAlerts = async ({
  validations,
  notifications,
  url,
}: {
  validations: ValidateResponseStatus[]
  notifications: Notification[]
  url: string
}): Promise<
  Array<{
    alert: string
    notification: string
    url: string
  }>
> => {
  const ipAddress = getIp()
  const allNotifications = validations
    .filter((val) => val.status)
    .map((val) => {
      const message = getMessageForAlert(val.alert, url, ipAddress)
      return Promise.all<any>(
        notifications.map((notification) => {
          switch (notification.type) {
            case 'mailgun': {
              return sendMailgun(
                {
                  subject: message.subject,
                  body: message.body,
                  sender: {
                    // TODO: Change this before release
                    name: 'http-probe',
                    email: 'http-probe@hyperjump.tech',
                  },
                  recipients: notification.recipients.join(','),
                },
                notification
              ).then(() => ({
                notification: 'mailgun',
                alert: val.alert,
                url,
              }))
            }
            case 'webhook': {
              return sendWebhook(notification.data as WebhookData).then(() => ({
                notification: 'webhook',
                alert: val.alert,
                url,
              }))
            }
            case 'smtp': {
              const transporter = createSmtpTransport(
                notification.data as SMTPData
              )
              return sendSmtpMail(transporter, {
                from: 'http-probe@hyperjump.tech',
                to: notification.recipients.join(','),
                subject: message.subject,
                html: message.body,
              })
            }
            default:
              return Promise.resolve({
                notification: '',
                alert: val.alert,
                url,
              })
          }
        })
      )
    })

  const sent = await Promise.all(allNotifications)
  return sent.reduce((acc, val) => acc.concat(val), [])
}
