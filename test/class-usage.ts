import test from 'ava';
import nock from 'nock';

import Etherpad, { Pad } from '../src/query-etherpad';
import checkConfiguration from '../src/check-configuration';
import { supportedMethods } from './_utils';

const conf = checkConfiguration({
  apiKey: `6b95f6d270f4f719f1b70e8ad2f742deef94c5bccee7d495250c0fbb8cecefc7`,
  url: `http://papapad.com`,
});

const nockServer = nock(`${conf.url}/api/${conf.apiVersion}`);

supportedMethods.forEach((methodName) => {
  nockServer
    .get(`/${methodName}`)
    .query(true)
    .reply(200, {
      code: 0,
      message: 'ok',
      data: `response: ${methodName}`,
    });
});

class MyEtherpad extends Etherpad {
  async getPublicStatus(
    qs: Pad,
    throwOnEtherpadError = true,
  ): Promise<boolean> {
    const result = await super.getPublicStatus(qs, throwOnEtherpadError);
    return true;
  }
}

test(`extend the class`, async (t) => {
  const etherpad = new MyEtherpad(conf);
  const result = await etherpad.getPublicStatus({ padID: `aPadId` });
  t.true(result, `sub classing is ok`);
});
