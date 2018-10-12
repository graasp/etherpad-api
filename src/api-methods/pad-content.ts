import { ApiMethodMap } from '../types'

const padContent: ApiMethodMap = {
  createSession: {
    version: `1.0.0`,
    params: [
      {
        name: `getText`,
      },
      {
        name: `rev`,
        optional: true,
      },
    ],
  },
  setText: {
    version: `1.0.0`,
    params: [
      {
        name: `padID`,
      },
      {
        name: `text`,
      },
    ],
  },
  appendText: {
    version: `1.2.13`,
    params: [
      {
        name: `padID`,
      },
      {
        name: `text`,
      },
    ],
  },
  getHTML: {
    version: `1.0.0`,
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
  setHTML: {
    version: `1.0.0`,
    params: [
      {
        name: `padID`,
      },
      {
        name: `html`,
      },
    ],
  },
  getAttributePool: {
    version: `1.2.8`,
    params: [
      {
        name: `padID`,
      },
    ],
  },
  getRevisionChangeset: {
    version: `1.2.8`,
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
  createDiffHTML: {
    version: `1.2.7`,
    params: [
      {
        name: `padID`,
      },
      {
        name: `startRev`,
      },
      {
        name: `endRev`,
      },
    ],
  },
  restoreRevision: {
    version: `1.2.11`,
    params: [
      {
        name: `padID`,
      },
      {
        name: `rev`,
      },
    ],
  },
}

export default padContent
