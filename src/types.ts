export interface Configuration {
  url?: string
  apiKey: string
  apiVersion?: string
  timeout?: number
}

export interface ApiParam {
  readonly name: string
  readonly optional?: boolean
}

export interface ApiMethod {
  readonly version: string
  readonly params: ApiParam[]
}

export interface ApiMethodMap {
  [apiMethodName: string]: ApiMethod
}

export interface RequestParams {
  uri: string
  json: boolean
  resolveWithFullResponse: boolean
  timeout: number
  qs: any
}
