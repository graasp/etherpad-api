import { ApiMethodMap } from '../types'

const author: ApiMethodMap = {
  createAuthor: {
    version: `1.0.0`,
    params: [
      {
        name: `name`,
        optional: true,
      },
    ],
  },
  createAuthorIfNotExistsFor: {
    version: `1.0.0`,
    params: [
      {
        name: `authorMapper`,
      },
      {
        name: `name`,
        optional: true,
      },
    ],
  },
  listPadsOfAuthor: {
    version: `1.0.0`,
    params: [
      {
        name: `authorID`,
      },
    ],
  },
  getAuthorName: {
    version: `1.1.0`,
    params: [
      {
        name: `authorID`,
      },
    ],
  },
}

export default author
