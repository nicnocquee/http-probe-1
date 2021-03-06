export interface Probe {
  id: number
  name: string
  description?: string
  request: Request
  alerts: string[]
}
