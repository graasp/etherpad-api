import test from 'ava'

import checkConfiguration, {
  messages,
  defaultConfiguration,
} from '../src/check-configuration'

const apiKey: string = `6b95f6d270f4f719f1b70e8ad2f742deef94c5bccee7d495250c0fbb8cecefc7`

test(`no arguments`, t => {
  // @ts-ignore
  const error = t.throws(() => checkConfiguration())
  t.is(error.message, messages.noConfig, `throw if no config is passed`)
})

test(`apikey – invalid`, t => {
  // @ts-ignore
  const errorNoApi = t.throws(() => checkConfiguration({}))
  t.is(errorNoApi.message, messages.noApiKey, `throw if no apikey`)
  // @ts-ignore
  const errorType = t.throws(() => checkConfiguration({ apiKey: true }))
  t.is(errorType.message, messages.noApiKey, `throw if wrong apikey type `)
  const errorEmpty = t.throws(() => checkConfiguration({ apiKey: `` }))
  t.is(errorEmpty.message, messages.noApiKey, `throw if empty string apikey`)
  const errorBad = t.throws(() => checkConfiguration({ apiKey: `badApikey` }))
  t.is(errorBad.message, messages.invalidApiKey, `throw if a malformed apikey`)
})

test(`apikey – valid`, t => {
  const conf = { apiKey }
  const configuration = checkConfiguration(conf)
  t.deepEqual(
    configuration,
    { ...defaultConfiguration, ...conf },
    `apikey is copied`,
  )
})

test(`url – invalid`, t => {
  const confWrongType = { apiKey, url: false }
  // @ts-ignore
  const configuration = checkConfiguration(confWrongType)
  t.deepEqual(
    configuration,
    { ...defaultConfiguration, ...{ apiKey } },
    `preserve default URL is no string is passed`,
  )
  const confWrongUrl = { apiKey, url: `etherpad` }
  const errorUrl = t.throws(() => checkConfiguration(confWrongUrl))
  t.is(errorUrl.message, messages.invalidUrl, `throw if wrong url `)
  const confUrlNoProtocol = { apiKey, url: `etherpad.com` }
  const errorProtocol = t.throws(() => checkConfiguration(confUrlNoProtocol))
  t.is(errorProtocol.message, messages.invalidUrl, `throw if no url protocol`)
})

test(`url – valid`, t => {
  const conf = { apiKey, url: `http://etherpad.com` }
  const configuration = checkConfiguration(conf)
  t.deepEqual(
    configuration,
    { ...defaultConfiguration, ...conf },
    `preserve default URL is no string is passed`,
  )
})

test(`version – invalid`, t => {
  const confWrongType = { apiKey, apiVersion: false }
  // @ts-ignore
  const configuration = checkConfiguration(confWrongType)
  t.deepEqual(
    configuration,
    { ...defaultConfiguration, ...{ apiKey } },
    `preserve default version is no string is passed`,
  )
  const confWrongVersion = { apiKey, apiVersion: `etherpad` }
  const errorUrl = t.throws(() => checkConfiguration(confWrongVersion))
  t.is(errorUrl.message, messages.invalidVersion, `throw if wrong url `)
})

test(`version – valid`, t => {
  const conf = { apiKey, apiVersion: `1.0.0` }
  const configuration = checkConfiguration(conf)
  t.deepEqual(
    configuration,
    { ...defaultConfiguration, ...conf },
    `version updated`,
  )
})

test(`timeout – invalid`, t => {
  // @ts-ignore
  const confWrongType = { apiKey, timeout: false }
  // @ts-ignore
  const configuration = checkConfiguration(confWrongType)
  t.deepEqual(
    configuration,
    { ...defaultConfiguration, ...{ apiKey } },
    `preserve default timeout is no string is passed`,
  )
  const confFloat = { apiKey, timeout: 1.357 }
  const configurationFloat = checkConfiguration(confFloat)
  t.deepEqual(
    configurationFloat,
    { ...defaultConfiguration, ...{ apiKey } },
    `preserve default timeout is float is passed`,
  )
})

test(`timeout – valid`, t => {
  const conf = { apiKey, timeout: 1234 }
  const configuration = checkConfiguration(conf)
  t.deepEqual(
    configuration,
    { ...defaultConfiguration, ...conf },
    `timeout updated`,
  )
})
