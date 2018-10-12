import { ApiMethodMap } from '../types'

const chat: ApiMethodMap = {
  getChatHistory: {
    version: `1.2.7`,
    params: [
      {
        name: `groupID`,
      },
      {
        name: `start`,
        optional: true,
      },
      {
        name: `end`,
        optional: true,
      },
    ],
  },
  getChatHead: {
    version: `1.2.7`,
    params: [
      {
        name: `padID`,
      },
    ],
  },
  appendChatMessage: {
    version: `1.2.12`,
    params: [
      {
        name: `padID`,
      },
      {
        name: `text`,
      },
      {
        name: `authorID`,
      },
      {
        name: `time`,
        optional: true,
      },
    ],
  },
}

export default chat
