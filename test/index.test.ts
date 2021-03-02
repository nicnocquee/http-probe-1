import { expect, test } from '@oclif/test'
import { resolve } from 'path'

import cmd = require('../src')

describe('http-probe', () => {
  test
    .stdout()
    .do(() => cmd.run(['--config', resolve('./config.json.example')]))
    .it('runs with normal config', (ctx) => {
      expect(ctx.stdout).to.contain('Parsed configuration')
      expect(ctx.stdout).to.contain('Interval: 20 seconds')
    })

  test
    .stdout()
    .do(() =>
      cmd.run(['--config', resolve('./test/testConfigs/noInterval.json')])
    )
    .it('runs with config without interval', (ctx) => {
      expect(ctx.stdout).to.contain('Parsed configuration')
      expect(ctx.stdout).to.contain('Interval: Not specified')
    })

  test
    .stderr()
    .do(() =>
      cmd.run(['--config', resolve('./test/testConfigs/noNotifications.json')])
    )
    .catch((error) => {
      expect(error.message).to.contain(
        'Notifications object does not exists or has length lower than 1!'
      )
    })
    .it('runs with config without notifications')

  test
    .stderr()
    .do(() =>
      cmd.run(['--config', resolve('./test/testConfigs/noProbes.json')])
    )
    .catch((error) => {
      expect(error.message).to.contain(
        'Probes object does not exists or has length lower than 1!'
      )
    })
    .it('runs with config without probes')
})
