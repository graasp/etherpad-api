import request from 'request-promise-native'
import createError from 'http-errors'
import { inspect, debuglog } from 'util'
import compareVersions from 'compare-versions'
import { OptionsWithUri } from 'request-promise-native'

import {
  Configuration,
  RequestParamsGenerator,
  EtherpadMethodMap,
} from './types'
import getConfiguration from './get-configuration'
import { buildEtherpadUrl, createGetParams } from './utils'

const logger = debuglog(`etherpad`)

const err503Txt: string = `Etherpad is unavailable`
// http://etherpad.org/doc/v1.7.0/#index_response_format
const etherpadErrorCodes = {
  1: 422, // wrong parameters     => UnprocessableEntity
  2: 500, // internal error       => InternalServerError
  3: 501, // no such function     => NotImplemented
  4: 422, // no or wrong API Key  => UnprocessableEntity
}

interface GroupID {
  groupID: string
}

interface AuthorID {
  authorID: string
}

interface SessionID {
  sessionID: string
}

interface PadID {
  padID: string
}

interface PadWithOptionalRev extends PadID {
  rev?: string
}

interface PadWithText extends PadID {
  text: string
}

export default function connect(config: Configuration): any {
  if (typeof config !== `object`) {
    throw new Error(`etherpad configuration is mandatory`)
  }
  config = getConfiguration(config)
  const ETHERPAD_URL: string = buildEtherpadUrl(config)
  const getParams: RequestParamsGenerator = createGetParams(
    ETHERPAD_URL,
    config,
  )

  async function queryEtherpad(
    method: string,
    qs: any = {},
    throwOnEtherpadError: boolean = true,
  ) {
    const params: OptionsWithUri = getParams(method, qs)

    try {
      const response = await request(params)
      // always throw on request bad response
      if (response.statusCode >= 400) {
        throw createError(response.statusCode, response.statusMessage)
      }
      const { body } = response
      body.code = +body.code

      if (body.code === 0) return body.data
      // silence etherpad error
      // ex: when wanting to know if a pad exist we might query it to check
      //     response will be bad be it's not an error per se
      if (!throwOnEtherpadError) return body.data
      logger(`${method} doesn't work properly`, qs)
      const code = etherpadErrorCodes[body.code]
      const message = JSON.stringify(body.message)
      logger(inspect(body, { colors: true }))
      const error = createError(code, message)
      throw error
    } catch (error) {
      logger(`error`)
      if (error.code === `ETIMEDOUT`) throw createError(408)
      if (error.code === `ECONNREFUSED`) throw createError(503, err503Txt)
      throw error
    }
  }

  function checkVersion(methodVersion: string): void {
    const result = compareVersions(config.apiVersion, methodVersion)
    if (result < 0) {
      const message = `Not implemented in Etherpad API v${config.apiVersion}.
      You should upgrade to >=v${methodVersion}.`
      throw createError(501, message)
    }
  }

  const etherPadApi: EtherpadMethodMap = {
    ////////
    // GROUPS
    ////////

    async createGroup(qs: void, throwOnEtherpadError: boolean = true) {
      checkVersion(`1.0.0`)
      return queryEtherpad(`createGroup`, qs, throwOnEtherpadError)
    },

    async createGroupIfNotExistsFor(
      qs: { groupMapper: string },
      throwOnEtherpadError: boolean = true,
    ) {
      checkVersion(`1.0.0`)
      return queryEtherpad(
        `createGroupIfNotExistsFor`,
        qs,
        throwOnEtherpadError,
      )
    },

    async deleteGroup(qs: GroupID, throwOnEtherpadError: boolean = true) {
      checkVersion(`1.0.0`)
      return queryEtherpad(`deleteGroup`, qs, throwOnEtherpadError)
    },

    async listPads(qs: GroupID, throwOnEtherpadError: boolean = true) {
      checkVersion(`1.0.0`)
      return queryEtherpad(`deleteGroup`, qs, throwOnEtherpadError)
    },

    async createGroupPad(
      qs: {
        groupID: string
        name: string
        text?: string
      },
      throwOnEtherpadError: boolean = true,
    ) {
      checkVersion(`1.0.0`)
      return queryEtherpad(`deleteGroup`, qs, throwOnEtherpadError)
    },

    async listAllGroups(qs: void, throwOnEtherpadError: boolean = true) {
      checkVersion(`1.0.0`)
      return queryEtherpad(`deleteGroup`, qs, throwOnEtherpadError)
    },

    ////////
    // AUTHOR
    ////////

    async createAuthor(
      qs: {
        name?: string
      },
      throwOnEtherpadError: boolean = true,
    ) {
      checkVersion(`1.0.0`)
      return queryEtherpad(`createAuthor`, qs, throwOnEtherpadError)
    },

    async createAuthorIfNotExistsFor(
      qs: {
        authorMapper: string
        name?: string
      },
      throwOnEtherpadError: boolean = true,
    ) {
      checkVersion(`1.0.0`)
      return queryEtherpad(
        `createAuthorIfNotExistsFor`,
        qs,
        throwOnEtherpadError,
      )
    },

    async listPadsOfAuthor(qs: AuthorID, throwOnEtherpadError: boolean = true) {
      checkVersion(`1.0.0`)
      return queryEtherpad(`listPadsOfAuthor`, qs, throwOnEtherpadError)
    },

    async getAuthorName(qs: AuthorID, throwOnEtherpadError: boolean = true) {
      checkVersion(`1.1.0`)
      return queryEtherpad(`getAuthorName`, qs, throwOnEtherpadError)
    },

    ////////
    // SESSION
    ////////

    async createSession(
      qs: {
        groupID: string
        authorID: string
        validUntil: number
      },
      throwOnEtherpadError: boolean = true,
    ) {
      checkVersion(`1.0.0`)
      return queryEtherpad(`createSession`, qs, throwOnEtherpadError)
    },

    async deleteSession(qs: SessionID, throwOnEtherpadError: boolean = true) {
      checkVersion(`1.0.0`)
      return queryEtherpad(`deleteSession`, qs, throwOnEtherpadError)
    },

    async getSessionInfo(qs: SessionID, throwOnEtherpadError: boolean = true) {
      checkVersion(`1.0.0`)
      return queryEtherpad(`getSessionInfo`, qs, throwOnEtherpadError)
    },

    async listSessionsOfGroup(
      qs: SessionID,
      throwOnEtherpadError: boolean = true,
    ) {
      checkVersion(`1.0.0`)
      return queryEtherpad(`listSessionsOfGroup`, qs, throwOnEtherpadError)
    },

    async listSessionsOfAuthor(
      qs: SessionID,
      throwOnEtherpadError: boolean = true,
    ) {
      checkVersion(`1.0.0`)
      return queryEtherpad(`listSessionsOfAuthor`, qs, throwOnEtherpadError)
    },

    ////////
    // PAD CONTENT
    ////////

    async getText(qs: PadWithOptionalRev, throwOnEtherpadError) {
      checkVersion(`1.0.0`)
      return queryEtherpad(`getText`, qs, throwOnEtherpadError)
    },

    async setText(qs: PadWithText, throwOnEtherpadError) {
      checkVersion(`1.0.0`)
      return queryEtherpad(`setText`, qs, throwOnEtherpadError)
    },

    async appendText(qs: PadWithText, throwOnEtherpadError) {
      checkVersion(`1.2.13`)
      return queryEtherpad(`appendText`, qs, throwOnEtherpadError)
    },

    async getHTML(qs: PadWithOptionalRev, throwOnEtherpadError) {
      checkVersion(`1.0.0`)
      return queryEtherpad(`getHTML`, qs, throwOnEtherpadError)
    },

    async setHTML(
      qs: {
        padID: string
        html: string
      },
      throwOnEtherpadError,
    ) {
      checkVersion(`1.0.0`)
      return queryEtherpad(`setHTML`, qs, throwOnEtherpadError)
    },

    async getAttributePool(qs: PadID, throwOnEtherpadError) {
      checkVersion(`1.2.8`)
      return queryEtherpad(`getAttributePool`, qs, throwOnEtherpadError)
    },

    async getRevisionChangeset(qs: PadWithOptionalRev, throwOnEtherpadError) {
      checkVersion(`1.2.8`)
      return queryEtherpad(`getRevisionChangeset`, qs, throwOnEtherpadError)
    },

    async createDiffHTML(
      qs: {
        padID: string
        startRev: string
        endRev: string
      },
      throwOnEtherpadError,
    ) {
      checkVersion(`1.2.7`)
      return queryEtherpad(`createDiffHTML`, qs, throwOnEtherpadError)
    },

    async restoreRevision(
      qs: {
        padID: string
        rev: string
      },
      throwOnEtherpadError,
    ) {
      checkVersion(`1.2.11`)
      return queryEtherpad(`restoreRevision`, qs, throwOnEtherpadError)
    },

    ////////
    // CHAT
    ////////

    async getChatHistory(
      qs: {
        padID: string
        start?: number
        end?: number
      },
      throwOnEtherpadError: boolean = true,
    ) {
      checkVersion(`1.2.7`)
      return queryEtherpad(`getChatHistory`, qs, throwOnEtherpadError)
    },

    async getChatHead(qs: PadID, throwOnEtherpadError: boolean = true) {
      checkVersion(`1.2.7`)
      return queryEtherpad(`getChatHead`, qs, throwOnEtherpadError)
    },

    async appendChatMessage(
      qs: {
        padID: string
        text: string
        authorID: string
        time?: number
      },
      throwOnEtherpadError: boolean = true,
    ) {
      checkVersion(`1.2.12`)
      return queryEtherpad(`appendChatMessage`, qs, throwOnEtherpadError)
    },

    ////////
    // PAD
    ////////

    async createPad(
      qs: {
        padID: string
        text?: string
      },
      throwOnEtherpadError: boolean = true,
    ) {
      checkVersion(`1.0.0`)
      return queryEtherpad(`createPad`, qs, throwOnEtherpadError)
    },

    async getRevisionsCount(qs: PadID, throwOnEtherpadError: boolean = true) {
      checkVersion(`1.0.0`)
      return queryEtherpad(`getRevisionsCount`, qs, throwOnEtherpadError)
    },

    async getSavedRevisionsCount(
      qs: PadID,
      throwOnEtherpadError: boolean = true,
    ) {
      checkVersion(`1.2.11`)
      return queryEtherpad(`getSavedRevisionsCount`, qs, throwOnEtherpadError)
    },

    async listSavedRevisions(qs: PadID, throwOnEtherpadError: boolean = true) {
      checkVersion(`1.2.11`)
      return queryEtherpad(`listSavedRevisions`, qs, throwOnEtherpadError)
    },

    async saveRevision(
      qs: {
        padID: string
        rev: string
      },
      throwOnEtherpadError: boolean = true,
    ) {
      checkVersion(`1.2.11`)
      return queryEtherpad(`saveRevision`, qs, throwOnEtherpadError)
    },

    async padUsersCount(qs: PadID, throwOnEtherpadError: boolean = true) {
      checkVersion(`1.0.0`)
      return queryEtherpad(`padUsersCount`, qs, throwOnEtherpadError)
    },

    async padUsers(qs: PadID, throwOnEtherpadError: boolean = true) {
      checkVersion(`1.1.0`)
      return queryEtherpad(`padUsers`, qs, throwOnEtherpadError)
    },

    async deletePad(qs: PadID, throwOnEtherpadError: boolean = true) {
      checkVersion(`1.0.0`)
      return queryEtherpad(`deletePad`, qs, throwOnEtherpadError)
    },

    async copyPad(
      qs: {
        sourceID: string
        destinationID: string
        force: boolean
      },
      throwOnEtherpadError: boolean = true,
    ) {
      checkVersion(`1.2.8`)
      return queryEtherpad(`copyPad`, qs, throwOnEtherpadError)
    },

    async movePad(
      qs: {
        sourceID: string
        destinationID: string
        force: boolean
      },
      throwOnEtherpadError: boolean = true,
    ) {
      checkVersion(`1.2.8`)
      return queryEtherpad(`movePad`, qs, throwOnEtherpadError)
    },

    async getReadOnlyID(qs: PadID, throwOnEtherpadError: boolean = true) {
      checkVersion(`1.0.0`)
      return queryEtherpad(`getReadOnlyID`, qs, throwOnEtherpadError)
    },

    async getPadID(
      qs: { readOnlyID: string },
      throwOnEtherpadError: boolean = true,
    ) {
      checkVersion(`1.2.10`)
      return queryEtherpad(`getPadID`, qs, throwOnEtherpadError)
    },

    async setPublicStatus(
      qs: {
        readOnlyID: string
        publicStatus: boolean
      },
      throwOnEtherpadError: boolean = true,
    ) {
      checkVersion(`1.0.0`)
      return queryEtherpad(`setPublicStatus`, qs, throwOnEtherpadError)
    },

    async getPublicStatus(qs: PadID, throwOnEtherpadError: boolean = true) {
      checkVersion(`1.0.0`)
      return queryEtherpad(`getPublicStatus`, qs, throwOnEtherpadError)
    },

    async setPassword(
      qs: {
        padID: string
        password: string
      },
      throwOnEtherpadError: boolean = true,
    ) {
      checkVersion(`1.0.0`)
      return queryEtherpad(`setPassword`, qs, throwOnEtherpadError)
    },

    async isPasswordProtected(qs: PadID, throwOnEtherpadError: boolean = true) {
      checkVersion(`1.0.0`)
      return queryEtherpad(`isPasswordProtected`, qs, throwOnEtherpadError)
    },

    async listAuthorsOfPad(qs: PadID, throwOnEtherpadError: boolean = true) {
      checkVersion(`1.0.0`)
      return queryEtherpad(`listAuthorsOfPad`, qs, throwOnEtherpadError)
    },

    async getLastEdited(qs: PadID, throwOnEtherpadError: boolean = true) {
      checkVersion(`1.0.0`)
      return queryEtherpad(`getLastEdited`, qs, throwOnEtherpadError)
    },

    async sendClientsMessage(
      qs: {
        padID: string
        msg: string
      },
      throwOnEtherpadError: boolean = true,
    ) {
      checkVersion(`1.1.0`)
      return queryEtherpad(`sendClientsMessage`, qs, throwOnEtherpadError)
    },

    async checkToken(qs: void, throwOnEtherpadError: boolean = true) {
      checkVersion(`1.2.0`)
      return queryEtherpad(`checkToken`, qs, throwOnEtherpadError)
    },

    ////////
    // PADS
    ////////

    async listAllPads(qs: void, throwOnEtherpadError: boolean = true) {
      checkVersion(`1.2.1`)
      return queryEtherpad(`checkToken`, qs, throwOnEtherpadError)
    },
  }

  return Object.freeze(etherPadApi)
}
