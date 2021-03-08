import { AxiosRequestConfig, AxiosResponse } from 'axios'

export interface ExtraData {
  requestStartedAt: Date
  responseTime: Date
}

export interface AxiosRequestConfigWithExtraData extends AxiosRequestConfig {
  extraData?: ExtraData
}

export interface AxiosResponseWithExtraData extends AxiosResponse {
  extraData?: ExtraData
}

export interface RequestConfig extends Omit<AxiosRequestConfig, 'data'> {
  body: JSON
  timeout: number
}
