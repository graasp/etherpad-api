import test from 'ava'
import nock from 'nock'

import connect from '../src/query-etherpad'
import checkConfiguration from '../src/check-configuration'
import { supportedMethods } from './_utils'

const conf = checkConfiguration({
  apiKey: `6b95f6d270f4f719f1b70e8ad2f742deef94c5bccee7d495250c0fbb8cecefc7`,
  url: `http://papapad.com`,
})

const nockServer = nock(`${conf.url}/api/${conf.apiVersion}`)

supportedMethods.forEach(methodName => {
  nockServer
    .get(`/${methodName}`)
    .query(true)
    .reply(200, {
      code: 0,
      message: 'ok',
      data: `${methodName}`,
    })
})

test(`call all methods`, async t => {
  const etherpad = connect(conf)
  // nock will throw if we call 2 times the same route
  await Promise.all(
    supportedMethods.map(methodName => etherpad[methodName]({}, false)),
  )
  t.pass(`all done`)
})
