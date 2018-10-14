import request from 'request-promise-native'
import createError from 'http-errors'
import { inspect, debuglog } from 'util'
import compareVersions from 'compare-versions'
import { OptionsWithUri } from 'request-promise-native'

import { EtherpadConfiguration } from './types'
import checkConfiguration from './check-configuration'
import { buildEtherpadUrl, isTimeout, isConnectionRefused } from './utils'

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

class Etherpad {
  private apiUrl: string
  private apiVersion: string
  private apiKey: string
  private timeout: number

  constructor(config: EtherpadConfiguration) {
    config = checkConfiguration(config)
    this.apiUrl = buildEtherpadUrl(config)
    this.timeout = config.timeout
    this.apiVersion = config.apiVersion
    this.apiKey = config.apiKey
  }

  private getParams(method: string, qs: any = {}): OptionsWithUri {
    const options: OptionsWithUri = {
      uri: `${this.apiUrl}/${method}`,
      json: true,
      timeout: this.timeout,
      qs: { ...qs, apikey: this.apiKey },
    }
    return options
  }

  private async query(
    method: string,
    qs: any = {},
    throwOnEtherpadError: boolean = true,
  ) {
    const params: OptionsWithUri = this.getParams(method, qs)

    try {
      const body = await request(params)
      body.code = +body.code
      if (body.code === 0) return body.data
      // silence etherpad error
      // ex: when wanting to know if a pad exist we might query it to check
      //     response will be bad be it's not an error per se
      if (!throwOnEtherpadError) return body.data
      logger(`${method} doesn't work properly`, qs)
      const code = etherpadErrorCodes[body.code]
      const message = body.message
      logger(inspect(body, { colors: true }))
      const error = createError(code, message)
      throw error
    } catch (error) {
      // All failed requests are handled here with request-promise-*
      // https://www.npmjs.com/package/request-promise#rejected-promises-and-the-simple-option
      logger(error)
      if (isTimeout(error)) throw createError(408)
      if (isConnectionRefused(error)) throw createError(503, err503Txt)
      throw createError(error.statusCode, error.message || error.statusMessage)
    }
  }

  private checkVersion(methodVersion: string): void {
    const result = compareVersions(this.apiVersion, methodVersion)
    if (result < 0) {
      const message = `Not implemented in Etherpad API v${
        this.apiVersion
      }. You should upgrade to >=v${methodVersion}`
      throw createError(501, message)
    }
  }

  ////////
  // GROUPS
  ////////

  async createGroup(qs?: void, throwOnEtherpadError: boolean = true) {
    this.checkVersion(`1.0.0`)
    return this.query(`createGroup`, qs, throwOnEtherpadError)
  }

  async createGroupIfNotExistsFor(
    qs: { groupMapper: string },
    throwOnEtherpadError: boolean = true,
  ) {
    this.checkVersion(`1.0.0`)
    return this.query(`createGroupIfNotExistsFor`, qs, throwOnEtherpadError)
  }

  async deleteGroup(qs: GroupID, throwOnEtherpadError: boolean = true) {
    this.checkVersion(`1.0.0`)
    return this.query(`deleteGroup`, qs, throwOnEtherpadError)
  }

  async listPads(qs: GroupID, throwOnEtherpadError: boolean = true) {
    this.checkVersion(`1.0.0`)
    return this.query(`listPads`, qs, throwOnEtherpadError)
  }

  async createGroupPad(
    qs: {
      groupID: string
      padName: string
      text?: string
    },
    throwOnEtherpadError: boolean = true,
  ) {
    this.checkVersion(`1.0.0`)
    return this.query(`createGroupPad`, qs, throwOnEtherpadError)
  }

  async listAllGroups(qs?: void, throwOnEtherpadError: boolean = true) {
    this.checkVersion(`1.0.0`)
    return this.query(`listAllGroups`, qs, throwOnEtherpadError)
  }

  ////////
  // AUTHOR
  ////////

  async createAuthor(
    qs: { name?: string },
    throwOnEtherpadError: boolean = true,
  ) {
    this.checkVersion(`1.0.0`)
    return this.query(`createAuthor`, qs, throwOnEtherpadError)
  }

  async createAuthorIfNotExistsFor(
    qs: {
      authorMapper: string
      name?: string
    },
    throwOnEtherpadError: boolean = true,
  ) {
    this.checkVersion(`1.0.0`)
    return this.query(`createAuthorIfNotExistsFor`, qs, throwOnEtherpadError)
  }

  async listPadsOfAuthor(qs: AuthorID, throwOnEtherpadError: boolean = true) {
    this.checkVersion(`1.0.0`)
    return this.query(`listPadsOfAuthor`, qs, throwOnEtherpadError)
  }

  async getAuthorName(qs: AuthorID, throwOnEtherpadError: boolean = true) {
    this.checkVersion(`1.1.0`)
    return this.query(`getAuthorName`, qs, throwOnEtherpadError)
  }

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
    this.checkVersion(`1.0.0`)
    return this.query(`createSession`, qs, throwOnEtherpadError)
  }

  async deleteSession(qs: SessionID, throwOnEtherpadError: boolean = true) {
    this.checkVersion(`1.0.0`)
    return this.query(`deleteSession`, qs, throwOnEtherpadError)
  }

  async getSessionInfo(qs: SessionID, throwOnEtherpadError: boolean = true) {
    this.checkVersion(`1.0.0`)
    return this.query(`getSessionInfo`, qs, throwOnEtherpadError)
  }

  async listSessionsOfGroup(qs: GroupID, throwOnEtherpadError: boolean = true) {
    this.checkVersion(`1.0.0`)
    return this.query(`listSessionsOfGroup`, qs, throwOnEtherpadError)
  }

  async listSessionsOfAuthor(
    qs: AuthorID,
    throwOnEtherpadError: boolean = true,
  ) {
    this.checkVersion(`1.0.0`)
    return this.query(`listSessionsOfAuthor`, qs, throwOnEtherpadError)
  }

  ////////
  // PAD CONTENT
  ////////

  async getText(qs: PadWithOptionalRev, throwOnEtherpadError: boolean = true) {
    this.checkVersion(`1.0.0`)
    return this.query(`getText`, qs, throwOnEtherpadError)
  }

  async setText(qs: PadWithText, throwOnEtherpadError: boolean = true) {
    this.checkVersion(`1.0.0`)
    return this.query(`setText`, qs, throwOnEtherpadError)
  }

  async appendText(qs: PadWithText, throwOnEtherpadError: boolean = true) {
    this.checkVersion(`1.2.13`)
    return this.query(`appendText`, qs, throwOnEtherpadError)
  }

  async getHTML(qs: PadWithOptionalRev, throwOnEtherpadError: boolean = true) {
    this.checkVersion(`1.0.0`)
    return this.query(`getHTML`, qs, throwOnEtherpadError)
  }

  async setHTML(
    qs: {
      padID: string
      html: string
    },
    throwOnEtherpadError,
  ) {
    this.checkVersion(`1.0.0`)
    return this.query(`setHTML`, qs, throwOnEtherpadError)
  }

  async getAttributePool(qs: PadID, throwOnEtherpadError: boolean = true) {
    this.checkVersion(`1.2.8`)
    return this.query(`getAttributePool`, qs, throwOnEtherpadError)
  }

  async getRevisionChangeset(
    qs: PadWithOptionalRev,
    throwOnEtherpadError: boolean = true,
  ) {
    this.checkVersion(`1.2.8`)
    return this.query(`getRevisionChangeset`, qs, throwOnEtherpadError)
  }

  async createDiffHTML(
    qs: {
      padID: string
      startRev: string
      endRev: string
    },
    throwOnEtherpadError,
  ) {
    this.checkVersion(`1.2.7`)
    return this.query(`createDiffHTML`, qs, throwOnEtherpadError)
  }

  async restoreRevision(
    qs: {
      padID: string
      rev: string
    },
    throwOnEtherpadError,
  ) {
    this.checkVersion(`1.2.11`)
    return this.query(`restoreRevision`, qs, throwOnEtherpadError)
  }

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
    this.checkVersion(`1.2.7`)
    return this.query(`getChatHistory`, qs, throwOnEtherpadError)
  }

  async getChatHead(qs: PadID, throwOnEtherpadError: boolean = true) {
    this.checkVersion(`1.2.7`)
    return this.query(`getChatHead`, qs, throwOnEtherpadError)
  }

  async appendChatMessage(
    qs: {
      padID: string
      text: string
      authorID: string
      time?: number
    },
    throwOnEtherpadError: boolean = true,
  ) {
    this.checkVersion(`1.2.12`)
    return this.query(`appendChatMessage`, qs, throwOnEtherpadError)
  }

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
    this.checkVersion(`1.0.0`)
    return this.query(`createPad`, qs, throwOnEtherpadError)
  }

  async getRevisionsCount(qs: PadID, throwOnEtherpadError: boolean = true) {
    this.checkVersion(`1.0.0`)
    return this.query(`getRevisionsCount`, qs, throwOnEtherpadError)
  }

  async getSavedRevisionsCount(
    qs: PadID,
    throwOnEtherpadError: boolean = true,
  ) {
    this.checkVersion(`1.2.11`)
    return this.query(`getSavedRevisionsCount`, qs, throwOnEtherpadError)
  }

  async listSavedRevisions(qs: PadID, throwOnEtherpadError: boolean = true) {
    this.checkVersion(`1.2.11`)
    return this.query(`listSavedRevisions`, qs, throwOnEtherpadError)
  }

  async saveRevision(
    qs: PadWithOptionalRev,
    throwOnEtherpadError: boolean = true,
  ) {
    this.checkVersion(`1.2.11`)
    return this.query(`saveRevision`, qs, throwOnEtherpadError)
  }

  async padUsersCount(qs: PadID, throwOnEtherpadError: boolean = true) {
    this.checkVersion(`1.0.0`)
    return this.query(`padUsersCount`, qs, throwOnEtherpadError)
  }

  async padUsers(qs: PadID, throwOnEtherpadError: boolean = true) {
    this.checkVersion(`1.1.0`)
    return this.query(`padUsers`, qs, throwOnEtherpadError)
  }

  async deletePad(qs: PadID, throwOnEtherpadError: boolean = true) {
    this.checkVersion(`1.0.0`)
    return this.query(`deletePad`, qs, throwOnEtherpadError)
  }

  async copyPad(
    qs: {
      sourceID: string
      destinationID: string
      force?: boolean
    },
    throwOnEtherpadError: boolean = true,
  ) {
    this.checkVersion(`1.2.8`)
    return this.query(`copyPad`, qs, throwOnEtherpadError)
  }

  async movePad(
    qs: {
      sourceID: string
      destinationID: string
      force?: boolean
    },
    throwOnEtherpadError: boolean = true,
  ) {
    this.checkVersion(`1.2.8`)
    return this.query(`movePad`, qs, throwOnEtherpadError)
  }

  async getReadOnlyID(qs: PadID, throwOnEtherpadError: boolean = true) {
    this.checkVersion(`1.0.0`)
    return this.query(`getReadOnlyID`, qs, throwOnEtherpadError)
  }

  async getPadID(
    qs: { readOnlyID: string },
    throwOnEtherpadError: boolean = true,
  ) {
    this.checkVersion(`1.2.10`)
    return this.query(`getPadID`, qs, throwOnEtherpadError)
  }

  async setPublicStatus(
    qs: {
      padID: string
      publicStatus: boolean
    },
    throwOnEtherpadError: boolean = true,
  ) {
    this.checkVersion(`1.0.0`)
    return this.query(`setPublicStatus`, qs, throwOnEtherpadError)
  }

  async getPublicStatus(qs: PadID, throwOnEtherpadError: boolean = true) {
    this.checkVersion(`1.0.0`)
    return this.query(`getPublicStatus`, qs, throwOnEtherpadError)
  }

  async setPassword(
    qs: {
      padID: string
      password: string
    },
    throwOnEtherpadError: boolean = true,
  ) {
    this.checkVersion(`1.0.0`)
    return this.query(`setPassword`, qs, throwOnEtherpadError)
  }

  async isPasswordProtected(qs: PadID, throwOnEtherpadError: boolean = true) {
    this.checkVersion(`1.0.0`)
    return this.query(`isPasswordProtected`, qs, throwOnEtherpadError)
  }

  async listAuthorsOfPad(qs: PadID, throwOnEtherpadError: boolean = true) {
    this.checkVersion(`1.0.0`)
    return this.query(`listAuthorsOfPad`, qs, throwOnEtherpadError)
  }

  async getLastEdited(qs: PadID, throwOnEtherpadError: boolean = true) {
    this.checkVersion(`1.0.0`)
    return this.query(`getLastEdited`, qs, throwOnEtherpadError)
  }

  async sendClientsMessage(
    qs: {
      padID: string
      msg: string
    },
    throwOnEtherpadError: boolean = true,
  ) {
    this.checkVersion(`1.1.0`)
    return this.query(`sendClientsMessage`, qs, throwOnEtherpadError)
  }

  async checkToken(qs?: void, throwOnEtherpadError: boolean = true) {
    this.checkVersion(`1.2.0`)
    return this.query(`checkToken`, qs, throwOnEtherpadError)
  }

  ////////
  // PADS
  ////////

  async listAllPads(qs?: void, throwOnEtherpadError: boolean = true) {
    this.checkVersion(`1.2.1`)
    return this.query(`listAllPads`, qs, throwOnEtherpadError)
  }
}

export default function connect(config: EtherpadConfiguration): Etherpad {
  return new Etherpad(config)
}
