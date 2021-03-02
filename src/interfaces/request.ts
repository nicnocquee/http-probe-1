export interface Request {
  method: string
  url: string
  headers?: Headers
  body?: JSON
}
