import test from 'ava'
import nock from 'nock'
import createError from 'http-errors'

import connect from './query-etherpad'
import checkConfiguration, { messages } from './check-configuration'
import { Configuration } from './types'

import { supportedMethods } from './_test-utils'

const conf: Configuration = checkConfiguration({
  apiKey: `6b95f6d270f4f719f1b70e8ad2f742deef94c5bccee7d495250c0fbb8cecefc7`,
  url: `http://etherpad.com`,
  timeout: 40,
})

nock(`${conf.url}/api/${conf.apiVersion}`)
  .get(`/listAllPads`)
  .query(true)
  .reply(200, {
    code: 0,
    message: 'ok',
    data: { padIDs: ['testPad', 'thePadsOfTheOthers'] },
  })
  .get(`/getLastEdited`)
  .query(true)
  .reply(200, {
    code: 1,
    message: `padID does not exist`,
    data: null,
  })
  .get(`/listAllGroups`)
  .query(true)
  .reply(200, {
    code: 2,
    message: 'internal error',
    data: null,
  })
  .get(`/checkToken`)
  .query(true)
  .reply(200, {
    code: 4,
    message: 'no or wrong API Key',
    data: null,
  })
  .get(`/createGroupPad`)
  .query(true)
  .reply(200, {
    code: 1,
    message: 'pad does already exist',
    data: null,
  })
  // don't use replyWithError because it doesn't set any status code
  // https://www.npmjs.com/package/nock#replying-with-errors
  .get(`/deleteSession`)
  .query(true)
  .reply(400, `BadRequest`)
  .get(`/getAuthorName`)
  .query(true)
  .reply(509, `NetworkAuthenticationRequired`)

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

test(`regular call`, async t => {
  const etherpad = connect(conf)
  const data = await etherpad.listAllPads()
  t.deepEqual(
    data,
    { padIDs: ['testPad', 'thePadsOfTheOthers'] },
    `get only etherpad data`,
  )
})

test(`api error – code 1 => 422`, async t => {
  const etherpad = connect(conf)
  const error = await t.throwsAsync(() =>
    etherpad.getLastEdited({ padID: `tutu` }),
  )
  t.is(error.statusCode, 422, `has the right status code`)
  t.is(error.message, `padID does not exist`, `keep etherpad message`)
})

test(`api error – code 2 => 500`, async t => {
  const etherpad = connect(conf)
  const error = await t.throwsAsync(() => etherpad.listAllGroups())
  t.is(error.statusCode, 500, `has the right status code`)
  t.is(error.message, `internal error`, `keep etherpad message`)
})

test(`api error – code 4 => 422`, async t => {
  const etherpad = connect(conf)
  const error = await t.throwsAsync(() => etherpad.checkToken())
  t.is(error.statusCode, 422, `has the right status code`)
  t.is(error.message, `no or wrong API Key`, `keep etherpad message`)
})

test(`api error – we can choose to ignore errors`, async t => {
  const etherpad = connect(conf)
  const data = await etherpad.createGroupPad(
    {
      groupID: `hiswe`,
      padName: `halya`,
    },
    false,
  )
  t.is(data, null, `doesn't throw and send us the Etherpad data`)
})

test(`server error – are handled `, async t => {
  const etherpad = connect(conf)
  const error400 = await t.throwsAsync(() =>
    etherpad.deleteSession({ sessionID: `hiswe` }),
  )
  t.is(error400.statusCode, 400, `has the right status code`)
  // don't know why nock doesn't keep the original message…
  t.is(error400.message, `400 - "BadRequest"`, `keep etherpad message`)
  const error509 = await t.throwsAsync(() =>
    etherpad.getAuthorName({ authorID: `hiswe` }),
  )
  t.is(error509.statusCode, 509, `has the right status code`)
  t.is(
    error509.message,
    `509 - "NetworkAuthenticationRequired"`,
    `keep etherpad message`,
  )
})
