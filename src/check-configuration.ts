import isUrl from 'is-url'

import { EtherpadConfiguration } from './types'
import { isString, isInteger, isApiKey, isVersion } from './utils'

export const defaultConfiguration: EtherpadConfiguration = Object.freeze({
  timeout: 1000,
  apiVersion: `1.2.13`,
  url: `http://0.0.0.0:9001`,
  apiKey: `0000000000000000000000000000000000000000000000000000000000000000`,
})

export const messages = {
  noConfig: `Etherpad configuration is mandatory`,
  noApiKey: `Etherpad api key need to be a string`,
  invalidApiKey: `Etherpad api key is invalid`,
  invalidUrl: `Etherpad url is invalid`,
  invalidVersion: `Etherpad version is invalid`,
}

export default function getConfiguration(
  config: EtherpadConfiguration,
): EtherpadConfiguration {
  if (typeof config !== `object`) throw new Error(messages.noConfig)
  if (!isString(config.apiKey)) throw new Error(messages.noApiKey)
  if (!isApiKey(config.apiKey)) throw new Error(messages.invalidApiKey)
  const url: string = isString(config.url)
    ? config.url.trim()
    : defaultConfiguration.url
  if (!isUrl(url)) throw new Error(messages.invalidUrl)

  const apiVersion: string = isString(config.apiVersion)
    ? config.apiVersion.trim()
    : defaultConfiguration.apiVersion
  if (!isVersion(apiVersion)) throw new Error(messages.invalidVersion)
  const securedConfig: EtherpadConfiguration = {
    url,
    apiVersion,
    apiKey: config.apiKey.trim(),
    timeout: isInteger(config.timeout)
      ? config.timeout
      : defaultConfiguration.timeout,
  }
  return securedConfig
}
