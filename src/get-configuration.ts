import validUrl from 'valid-url'

import { Configuration } from './types'
import { isString, isInteger } from './utils'

const defaultTimeout: number = 1000
const localEtherpadUrl: string = `http://0.0.0.0:9001`
// http://etherpad.org/doc/v1.7.0/#index_api_version
const lastEtherpadApiVersion: string = `1.2.13`

export default function getConfiguration(config: Configuration): Configuration {
  if (!isString(config.apiKey)) {
    throw new Error(`etherpad api key need to be a string`)
  }
  const url: string = isString(config.url)
    ? config.url.trim()
    : localEtherpadUrl
  if (!validUrl.isUri(url)) throw new Error(`etherpad uri is invalid`)

  const apiVersion: string = isString(config.apiVersion)
    ? config.apiVersion.trim()
    : lastEtherpadApiVersion
  if (!/^\d+\.\d+\.\d+$/.test(apiVersion)) {
    throw new Error(`Etherpad version is invalid`)
  }
  const securedConfig: Configuration = {
    url,
    apiVersion,
    apiKey: config.apiKey.trim(),
    timeout: isInteger(config.timeout) ? config.timeout : defaultTimeout,
  }
  return securedConfig
}
