import { Config } from '../interfaces/config'
import { log } from 'console'
import { probing } from '../utils/probing'
import { validateResponse, sendAlerts } from './alert'

const MILLISECONDS = 1000
async function doProbes(config: Config) {
  let probRes
  let validatedResp

  log('\nProbes: ')
  config.probes.forEach(async (item) => {
    log(`Probe ID: ${item.id}`)
    log(`Probe Name: ${item.name}`)
    log(`Probe Description: ${item.description}`)
    log(`Probe Request Method: ${item.request.method}`)
    log(`Probe Request URL: ${item.request.url}`)
    log(`Probe Request Headers: ${JSON.stringify(item.request.headers)}`)
    log(`Probe Request Body: ${JSON.stringify(item.request.body)}`)
    log(`Probe Alerts: ${item.alerts.toString()}\n`)

    // probe each url
    log('\nProbing....')
    probRes = await probing(item)
    log('status:', probRes.status, 'for:', item.request.url)

    validatedResp = validateResponse(item.alerts, probRes)
    await sendAlerts({
      validations: validatedResp,
      notifications: config.notifications,
      url: item.request.url ?? '',
    })
  })
}

export function looper(config: Config) {
  const interval = config.interval ?? 0

  doProbes(config)
  if (interval > 0) {
    setInterval(doProbes, interval * MILLISECONDS, config)
  }
}
