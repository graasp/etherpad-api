export interface EtherpadConfiguration {
  url?: string
  apiKey: string
  apiVersion?: string
  timeout?: number
}

type EtherpadCodes = 0 | 1 | 2 | 3 | 4

export interface EtherpadResponse {
  code: EtherpadCodes
  message: string
  data: any
}
