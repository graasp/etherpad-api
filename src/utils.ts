import { URL } from 'url'
import { OptionsWithUri } from 'request-promise-native'

import { Configuration, RequestParamsGenerator } from './types'

export function isString(text: any): text is string {
  return typeof text === `string` && text.length > 0
}

export function isApiKey(apiKey: string): boolean {
  return /^[a-f\d]{64}$/.test(apiKey)
}

export function isVersion(version: string): boolean {
  return /^\d+\.\d+\.\d+$/.test(version)
}

export function isInteger(num: any): num is number {
  return Number.isInteger(num)
}

export function buildEtherpadUrl(config: Configuration): string {
  const ETHERPAD_URL: URL = new URL(config.url)
  ETHERPAD_URL.pathname = `api/${config.apiVersion}`
  return ETHERPAD_URL.toString()
}

export const createGetParams = (
  ETHERPAD_URL: string,
  config: Configuration,
): RequestParamsGenerator => (method: string, qs: any): OptionsWithUri => {
  const options: OptionsWithUri = {
    uri: `${ETHERPAD_URL}/${method}`,
    json: true,
    timeout: config.timeout,
    qs: { ...qs, apikey: config.apiKey },
  }
  return options
}
