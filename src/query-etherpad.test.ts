import test from 'ava'

import connect from './query-etherpad'
import { messages } from './check-configuration'
import { Configuration } from './types'

import { supportedMethods } from './_test-utils'

const conf: Configuration = {
  apiKey: `6b95f6d270f4f719f1b70e8ad2f742deef94c5bccee7d495250c0fbb8cecefc7`,
  // `6b95f6d270f4f719f1b70e8ad2f742deef94c5bccee7d495250c0fbb8cecefc7`
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
