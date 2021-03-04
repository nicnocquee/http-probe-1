import { AxiosResponse } from 'axios'

export interface SymonResponse extends AxiosResponse {
  timeToResponse: number // add measure the time for the request to complete
}
