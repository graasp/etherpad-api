import { OptionsWithUri } from 'request-promise-native'

export interface Configuration {
  url?: string
  apiKey: string
  apiVersion?: string
  timeout?: number
}

export type RequestParamsGenerator = (method: string, qs: any) => OptionsWithUri

export type EtherpadMethod = (
  qs: any,
  throwOnEtherpadError: boolean,
) => Promise<any>

export interface EtherpadMethodMap {
  readonly [apiMethodName: string]: EtherpadMethod
}
