import axios from 'axios'
import {
  AxiosRequestConfigWithExtraData,
  AxiosResponseWithExtraData,
  RequestConfig,
} from '../interfaces/request'

export const request = async (config: RequestConfig) => {
  const axiosInstance = axios.create()
  axiosInstance.interceptors.request.use(
    (axiosRequestConfig: AxiosRequestConfigWithExtraData) => {
      const data = {
        ...axiosRequestConfig,
        extraData: {
          ...axiosRequestConfig?.extraData,
          requestStartedAt: new Date().getTime(),
        },
      }
      return data
    }
  )
  axiosInstance.interceptors.response.use(
    (axiosResponse: AxiosResponseWithExtraData) => {
      const responseTime =
        new Date().getTime() -
        axiosResponse?.extraData?.requestStartedAt?.getTime()!
      const data = {
        ...axiosResponse,
        extraData: {
          ...axiosResponse?.extraData,
          responseTime,
        },
      }
      return data
    },
    (axiosResponse: AxiosResponseWithExtraData) => {
      const responseTime =
        new Date().getTime() -
        axiosResponse?.extraData?.requestStartedAt?.getTime()!
      const data = {
        ...axiosResponse,
        extraData: {
          ...axiosResponse?.extraData,
          responseTime,
        },
      }
      throw data
    }
  )
  return axiosInstance.request({
    ...config,
    data: config.body,
  })
}
