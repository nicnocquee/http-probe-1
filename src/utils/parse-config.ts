import { readFileSync } from 'fs'
import { Config } from '../interfaces/config'

export const parseConfig = async (configPath: string) => {
  // Read file from configPath
  const config: string = readFileSync(configPath).toString()

  // Parse the content
  const output: Config = JSON.parse(config)

  // Return the output as string
  return output
}
