import { MailgunData, SMTPData, SendgridData, WebhookData } from './data'
export interface Notification {
  id: string
  type: 'smtp' | 'mailgun' | 'sendgrid' | 'webhook'
  recipients: string[]
  data: MailgunData | SMTPData | SendgridData | WebhookData
}
