import axios from 'axios'

import { WebhookData } from '../interfaces/data'

export const sendWebhook = async (data: WebhookData) => {
  try {
    if (!data.url) throw new Error(`Webhook url is not provided`)

    if (data.method !== 'GET' && data.method !== 'POST') {
      throw new Error(
        `Http method ${data.method} is not allowed. Webhook only allows GET or POST.`
      )
    }

    const res = await axios({ url: data.url, method: data.method })

    return res
  } catch (error) {
    throw new Error(error)
  }
}
