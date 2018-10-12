import { ApiMethodMap } from '../types'

const groups: ApiMethodMap = {
  createGroup: {
    version: `1.0.0`,
    params: [],
  },
  createGroupIfNotExistsFor: {
    version: `1.0.0`,
    params: [
      {
        name: `groupMapper`,
      },
    ],
  },
  deleteGroup: {
    version: `1.0.0`,
    params: [
      {
        name: `groupID`,
      },
    ],
  },
  listPads: {
    version: `1.0.0`,
    params: [
      {
        name: `groupID`,
      },
    ],
  },
  createGroupPad: {
    version: `1.0.0`,
    params: [
      {
        name: `groupID`,
      },
      {
        name: `padName`,
      },
      {
        name: `text`,
        optional: true,
      },
    ],
  },
  listAllGroups: {
    version: `1.1.0`,
    params: [],
  },
}

export default groups
