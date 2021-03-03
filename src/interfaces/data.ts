export interface MailgunData {
  apiKey: string
  domain: string
}

export interface SendgridData {
  apiKey: string
}

export interface SMTPData {
  hostname: string
  port: number
  username: string
  password: string
}

export interface WebhookData {
  url: string
  method: HttpRequestMethod
}

enum HttpRequestMethod {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  PATCH = 'PATCH',
  DELETE = 'DELETE',
}
