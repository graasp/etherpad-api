import request from 'request-promise-native'
import createError from 'http-errors'
import { inspect, debuglog } from 'util'

import { Configuration } from './types'
import getConfiguration from './get-configuration'
import { buildEtherpadUrl, createGetParams } from './utils'

const logger = debuglog(`etherpad`)

const err503Txt = `Etherpad is unavailable. Soit il n'est pas lancé ou la configuration est mauvaise`
// http://etherpad.org/doc/v1.7.0/#index_response_format
const etherpadErrorCodes = {
  1: 422, // wrong parameters     => UnprocessableEntity
  2: 500, // internal error       => InternalServerError
  3: 501, // no such function     => NotImplemented
  4: 422, // no or wrong API Key  => UnprocessableEntity
}

export default function connect(config: Configuration): any {
  if (typeof config !== `object`) throw new Error(`configuration is mandatory`)
  config = getConfiguration(config)
  const ETHERPAD_URL: string = buildEtherpadUrl(config)
  const getParams = createGetParams(ETHERPAD_URL, config)

  async function queryEtherpad(
    method: string,
    qs = {},
    throwOnEtherpadError: boolean = true,
  ) {
    const params = getParams(method, qs)
    try {
      const response = await request(params)
      if (response.statusCode >= 400) {
        throw createError(response.statusCode, response.statusMessage)
      }
      const { body } = response
      body.code = +body.code

      if (body.code === 0) return body.data
      if (!throwOnEtherpadError) return body.data
      logger(`${method} doesn't work properly`, qs)
      const code = etherpadErrorCodes[body.code]
      const message = JSON.stringify(body.message)
      console.log(inspect(body, { colors: true }))
      const error = createError(code, message)
      throw error
    } catch (error) {
      logger(`error`)
      if (error.code === `ETIMEDOUT`) throw createError(408)
      if (error.code === `ECONNREFUSED`) throw createError(503, err503Txt)
      throw error
    }
  }
}
