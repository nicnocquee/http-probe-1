import {
  SMTPData,
  MailgunData,
  SendgridData,
  WebhookData,
} from './interfaces/data'
import { Command, flags } from '@oclif/command'
import { Validation } from './interfaces/validation'
import { validateConfig } from './utils/validate-config'
import { parseConfig } from './utils/parse-config'
import { Config } from './interfaces/config'
import { sendWebhook } from './utils/webhook'

class SymonAgent extends Command {
  static description = 'describe the command here'

  static flags = {
    // add --version flag to show CLI version
    version: flags.version({ char: 'v' }),
    help: flags.help({ char: 'h' }),
    // flag with a value (-n, --name=VALUE)
    config: flags.string({
      char: 'c',
      description:
        "JSON configuration file path e.g './config.json' (default ./config.json)",
    }),
    // flag with no value (-f, --force)
    force: flags.boolean({ char: 'f' }),
  }

  async run() {
    const { flags } = this.parse(SymonAgent)

    // Set default config file to read
    // If there is a config file flag, override the default
    const file = flags.config || './config.json'

    // Read the config
    const config: Config = await parseConfig(file)

    // Check if config is valid
    const isConfigValid: Validation = await validateConfig(config)

    if (isConfigValid.valid) {
      // If config is valid, print the configuration
      this.log('Parsed configuration\n====================')
      this.log(
        `Interval: ${
          config.interval ? `${config.interval} seconds\n` : 'Not specified\n'
        }`
      )

      this.log(`Notifications: `)
      config.notifications.forEach((item) => {
        this.log(`Notification ID: ${item.id}`)
        this.log(`Notification Type: ${item.type}`)
        this.log(`Notification Recipients: ${item.recipients?.toString()}\n`)

        this.log(`Notifications Details:\n\n`)
        switch (item.type) {
          case 'smtp':
            this.log(`Hostname: ${(item.data as SMTPData).hostname}`)
            this.log(`Port: ${(item.data as SMTPData).port}`)
            this.log(`Username: ${(item.data as SMTPData).username}`)
            this.log(`Password: ${(item.data as SMTPData).password}`)
            break
          case 'mailgun':
            this.log(`API key: ${(item.data as MailgunData).apiKey}`)
            this.log(`Domain: ${(item.data as MailgunData).domain}`)
            break

          case 'sendgrid':
            this.log(`API key: ${(item.data as SendgridData).apiKey}`)
            break

          case 'webhook':
            sendWebhook(item.data as WebhookData)
            break
        }
      })

      this.log('Probes: ')
      config.probes.forEach((item) => {
        this.log(`Probe ID: ${item.id}`)
        this.log(`Probe Name: ${item.name}`)
        this.log(`Probe Description: ${item.description}`)
        this.log(`Probe Request Method: ${item.request.method}`)
        this.log(`Probe Request URL: ${item.request.url}`)
        this.log(
          `Probe Request Headers: ${JSON.stringify(item.request.headers)}`
        )
        this.log(`Probe Request Body: ${JSON.stringify(item.request.body)}`)
        this.log(`Probe Alerts: ${item.alerts.toString()}\n`)
      })
    } else {
      // If config is invalid, throw error
      this.error(isConfigValid.message, { exit: 100 })
    }
  }
}

export = SymonAgent
