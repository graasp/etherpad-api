# etherpad-api

[![npm version](https://badge.fury.io/js/%40hiswe%2Fetherpad-api.svg)](https://badge.fury.io/js/%40hiswe%2Fetherpad-api) [![Build Status](https://travis-ci.org/Hiswe/etherpad-api.svg?branch=master)](https://travis-ci.org/Hiswe/etherpad-api)

Promised based query to etherpad-lite

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->

- [how it works](#how-it-works)
- [configuration](#configuration)
- [use](#use)
- [full example](#full-example)
- [other stuff](#other-stuff)
  - [run the tests](#run-the-tests)
  - [alternatives](#alternatives)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## how it works

It uses [request-promise-native](https://www.npmjs.com/package/request-promise-native) to call each [Etherpad API endpoints](http://etherpad.org/doc/v1.7.0/#index_usage)

The API are similar

- Methods names are identical to the API documentation
- The same goes for the params
  You just have to pass them as an object

But there is some differences:

- `Etherpad-api` will reject any Etherpad response [which code isn't 0](http://etherpad.org/doc/v1.7.0/#index_response_format)
- All errors will be created by [http-errors](https://www.npmjs.com/package/http-errors)
- It will error if you try to call an endpoint that isn't implemented on the Etherpad API version you're using

## configuration

```js
const Etherpad = require('@hiswe/etherpad-api')

const etherpad = new Etherpad({
  apiKey: `6b95f6d270f4f719f1b70e8ad2f742deef94c5bccee7d495250c0fbb8cecefc7`,
  // API KEY
  url: `http://my-etherpad-server`,
  // default: http://0.0.0.0:9001 (local etherpad server)
  // full URL to your etherpad server
  apiVersion: `1.0.0`
  // default: latest (1.2.13)
  // If you want to prevent your application from calling unsupported methods
  timeout: 7000
  // default: 1000
  // request timeout
})

// now you have access to all etherpad methods…
```

## use

As an example: calling [getHTML](http://etherpad.org/doc/v1.7.0/#index_gethtml_padid_rev)

```js
etherpad
  .getHTML({ padID: `my-pad` })
  .then(data => console.log(data))
  .catch(error => console.log(error))
```

if you don't want to error on etherpad errors:
add `false` as the second parameter

```js
etherpad
  // add `false` as the second parameter
  .getHTML({ padID: `a-pad-that-does-not-exist` }, false)
  .then(data => {
    // data will be null because “padID does not exist”
    assert.equal(data, null)
    console.log(data)
  })
  .catch(error => console.log(error))
```

## full example

```js
const express = require('express')
const Etherpad = require('@hiswe/etherpad-api')

const app = express()
const etherpad = new Etherpad({
  url: `http://my-etherpad-server`,
  apiKey: `6b95f6d270f4f719f1b70e8ad2f742deef94c5bccee7d495250c0fbb8cecefc7`,
})

app.get(`/pads/:padID`, (req, res) => {
  const { padID } = req.params
  etherpad
    .getHTML({ padID })
    .then(padData => res.send(padData))
    .catch(error => res.status(error.statusCode).json(error))
})
```

## Class use

alternatively you could use/extend the original class

```js
const Etherpad = require('@hiswe/etherpad-api')

class MyEtherpad extends Etherpad {
  // …you can extend the class here
}

const etherpad = new MyEtherpad({
  url: `http://my-etherpad-server`,
  apiKey: `6b95f6d270f4f719f1b70e8ad2f742deef94c5bccee7d495250c0fbb8cecefc7`,
})
```

## other stuff

### run the tests

- clone the project
- `npm install`
- `npm test`

### alternatives

- [etherpad-lite-client](https://www.npmjs.com/package/etherpad-lite-client)
