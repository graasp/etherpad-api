import { ApiMethodMap } from '../types'

const pad: ApiMethodMap = {
  createPad: {
    version: `1.0.0`,
    params: [
      {
        name: `padID`,
      },
      {
        name: `text`,
        optional: true,
      },
    ],
  },
  getRevisionsCount: {
    version: `1.0.0`,
    params: [
      {
        name: `padID`,
      },
    ],
  },
  getSavedRevisionsCount: {
    version: `1.2.11`,
    params: [
      {
        name: `padID`,
      },
    ],
  },
  listSavedRevisions: {
    version: `1.2.11`,
    params: [
      {
        name: `padID`,
      },
    ],
  },
  saveRevision: {
    version: `1.2.11`,
    params: [
      {
        name: `padID`,
      },
      {
        name: `rev`,
        optional: true,
      },
    ],
  },
  padUsersCount: {
    version: `1.0.0`,
    params: [
      {
        name: `padID`,
      },
    ],
  },
  padUsers: {
    version: `1.1.0`,
    params: [
      {
        name: `padID`,
      },
    ],
  },
  deletePad: {
    version: `1.0.0`,
    params: [
      {
        name: `padID`,
      },
    ],
  },
  copyPad: {
    version: `1.2.8`,
    params: [
      {
        name: `sourceID`,
      },
      {
        name: `destinationID`,
      },
      {
        name: `force`,
        optional: true,
      },
    ],
  },
  movePad: {
    version: `1.2.8`,
    params: [
      {
        name: `sourceID`,
      },
      {
        name: `destinationID`,
      },
      {
        name: `force`,
        optional: true,
      },
    ],
  },
  getReadOnlyID: {
    version: `1.0.0`,
    params: [
      {
        name: `padID`,
      },
    ],
  },
  getPadID: {
    version: `1.2.10`,
    params: [
      {
        name: `readOnlyID`,
      },
    ],
  },
  setPublicStatus: {
    version: `1.0.0`,
    params: [
      {
        name: `readOnlyID`,
      },
      {
        name: `publicStatus`,
      },
    ],
  },
  getPublicStatus: {
    version: `1.0.0`,
    params: [
      {
        name: `padID`,
      },
    ],
  },
  setPassword: {
    version: `1.0.0`,
    params: [
      {
        name: `padID`,
      },
      {
        name: `password`,
      },
    ],
  },
  isPasswordProtected: {
    version: `1.0.0`,
    params: [
      {
        name: `padID`,
      },
    ],
  },
  listAuthorsOfPad: {
    version: `1.0.0`,
    params: [
      {
        name: `padID`,
      },
    ],
  },
  getLastEdited: {
    version: `1.0.0`,
    params: [
      {
        name: `padID`,
      },
    ],
  },
  sendClientsMessage: {
    version: `1.1.0`,
    params: [
      {
        name: `padID`,
      },
      {
        name: `msg`,
      },
    ],
  },
  checkToken: {
    version: `1.2.0`,
    params: [],
  },
}

export default pad
