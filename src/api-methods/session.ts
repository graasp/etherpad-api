import { ApiMethodMap } from '../types'

const session: ApiMethodMap = {
  createSession: {
    version: `1.0.0`,
    params: [
      {
        name: `groupID`,
      },
      {
        name: `authorID`,
      },
      {
        name: `validUntil`,
      },
    ],
  },
  deleteSession: {
    version: `1.0.0`,
    params: [
      {
        name: `sessionID`,
      },
    ],
  },
  getSessionInfo: {
    version: `1.0.0`,
    params: [
      {
        name: `sessionID`,
      },
    ],
  },
  listSessionsOfGroup: {
    version: `1.0.0`,
    params: [
      {
        name: `sessionID`,
      },
    ],
  },
  listSessionsOfAuthor: {
    version: `1.0.0`,
    params: [
      {
        name: `sessionID`,
      },
    ],
  },
}

export default session
