# query-etherpad

Utility to query etherpad-lite from a nodeJS application

## use

```js
import express from 'express'
import connect from '@hiswe/query-etherpad'

const app = express()
const etherpad = connect({
  url: `http://0.0.0.0:9001`,
  apiKey: `6b95f6d270f4f719f1b70e8ad2f742deef94c5bccee7d495250c0fbb8cecefc7`,
  apiVersion: `1.2.13`, // optional
})

app.get(`/groups`, async (req, res) => {
  try {
    const groups = await etherpad.listAllGroups()
    res.json(groups)
  } catch (error) {
    res.json(error)
  }
})
```
