import test from 'ava'

import connect from './query-etherpad'
import { messages } from './check-configuration'
import { Configuration } from './types'

import { supportedMethods } from './_test-utils'

const conf: Configuration = {
  apiKey: `6b95f6d270f4f719f1b70e8ad2f742deef94c5bccee7d495250c0fbb8cecefc7`,
}

test(`bad options`, t => {
  // @ts-ignore
  const error = t.throws(() => connect())
  t.is(error.message, messages.noConfig, `throw if no config is passed`)
})

test(`return an object if config is ok`, t => {
  const etherpad = connect(conf)
  t.deepEqual(
    Object.keys(etherpad).sort(),
    [...supportedMethods].sort(),
    `has the right methods`,
  )
})

test(`method throw if not supported by the api version`, async t => {
  const etherpad = connect({ ...conf, apiVersion: `1.0.0` })
  // listAllPads was implemented in 1.2.1
  const error = await t.throwsAsync(() => etherpad.listAllPads())
  t.is(
    error.message,
    `Not implemented in Etherpad API v1.0.0. You should upgrade to >=v1.2.1`,
    `has the right error message`,
  )
})
