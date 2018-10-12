import { Configuration } from './types'
import { URL } from 'url'
import { OptionsWithUri } from 'request-promise-native'

export function isString(text: any): text is string {
  return typeof text === `string` && text.length > 0
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
): any => (method: string, qs: any): OptionsWithUri => {
  const options: OptionsWithUri = {
    uri: `${ETHERPAD_URL}/${method}`,
    json: true,
    resolveWithFullResponse: true,
    timeout: config.timeout,
    qs: { ...qs, apikey: config.apiKey },
  }
  return options
}
