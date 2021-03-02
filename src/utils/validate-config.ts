import { Config } from '../interfaces/config'

export const validateConfig = async (configuration: Config) => {
  const data = configuration

  // Check if notifications object is exists
  if (!data.notifications || data.notifications.length === 0) {
    return {
      valid: false,
      message:
        'Notifications object does not exists or has length lower than 1!',
    }
  }

  // Check if notifications object is exists
  if (!data.probes || data.probes.length === 0) {
    return {
      valid: false,
      message: 'Probes object does not exists or has length lower than 1!',
    }
  }

  return {
    valid: true,
    message: '',
  }
}
