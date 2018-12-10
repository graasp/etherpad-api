import request from 'request-promise-native'
import createError from 'http-errors'
import { inspect, debuglog } from 'util'
import compareVersions from 'compare-versions'
import { OptionsWithUri } from 'request-promise-native'

import { EtherpadConfiguration, EtherpadResponse } from './types'
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

export interface Group {
  groupID: string
}
export interface GroupMapper {
  groupMapper: string
}
export interface Author {
  authorID: string
}
export interface AuthorSession extends Author, Group {
  validUntil: number
}
export interface AuthorName {
  name?: string
}
export interface AuthorMapper extends AuthorName {
  authorMapper: string
}
export interface Session {
  sessionID: string
}
export interface PadReadOnly {
  readOnlyID: string
}
export interface Pad {
  padID: string
}
export interface PadHtml extends Pad {
  html: string
}
export interface PadHtmlDiff extends Pad {
  startRev: string
  endRev: string
}
export interface PadDestination extends Pad {
  destinationID: string
  force?: boolean
}
export interface GroupPad extends Pad {
  padName: string
  text?: string
}
export interface PadRev extends Pad {
  rev: string
}
export interface PadOptionalRev extends Pad {
  rev?: string
}
export interface PadText extends Pad {
  text: string
}
export interface PadOptionalText extends Pad {
  text?: string
}
export interface PadPublicStatus extends Pad {
  publicStatus: boolean
}
export interface PadPassword extends Pad {
  password: string
}
export interface PadMessage extends Pad {
  msg: string
}
export interface PadChatHistory extends Pad {
  start?: number
  end?: number
}
export interface PadChatMessage extends PadText, Author {
  time?: number
}

export default class Etherpad {
  private _apiUrl: string
  private _apiVersion: string
  private _apiKey: string
  private _timeout: number

  constructor(config: EtherpadConfiguration) {
    // make sure we have an instance even if we forgot the “new” keyword
    if (!(this instanceof Etherpad)) {
      return new Etherpad(config)
    }
    config = checkConfiguration(config)
    this._apiUrl = buildEtherpadUrl(config)
    this._timeout = config.timeout
    this._apiVersion = config.apiVersion
    this._apiKey = config.apiKey
  }

  private _getParams(method: string, qs: any = {}): OptionsWithUri {
    const options: OptionsWithUri = {
      uri: `${this._apiUrl}/${method}`,
      json: true,
      timeout: this._timeout,
      qs: { ...qs, apikey: this._apiKey },
    }
    return options
  }

  private async _query(
    method: string,
    qs: any = {},
    throwOnEtherpadError = true,
  ) {
    const params: OptionsWithUri = this._getParams(method, qs)

    try {
      // EtherpadResponse
      const body = (await request(params)) as EtherpadResponse
      // body.code = +body.code
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

  private _checkVersion(methodVersion: string): void {
    const result = compareVersions(this._apiVersion, methodVersion)
    if (result < 0) {
      const message = `Not implemented in Etherpad API v${
        this._apiVersion
      }. You should upgrade to >=v${methodVersion}`
      throw createError(501, message)
    }
  }

  ////////
  // GROUPS
  ////////

  async createGroup(qs?: void, throwOnEtherpadError = true) {
    this._checkVersion(`1.0.0`)
    return this._query(`createGroup`, qs, throwOnEtherpadError)
  }

  async createGroupIfNotExistsFor(
    qs: GroupMapper,
    throwOnEtherpadError = true,
  ) {
    this._checkVersion(`1.0.0`)
    return this._query(`createGroupIfNotExistsFor`, qs, throwOnEtherpadError)
  }

  async deleteGroup(qs: Group, throwOnEtherpadError = true) {
    this._checkVersion(`1.0.0`)
    return this._query(`deleteGroup`, qs, throwOnEtherpadError)
  }

  async listPads(qs: Group, throwOnEtherpadError = true) {
    this._checkVersion(`1.0.0`)
    return this._query(`listPads`, qs, throwOnEtherpadError)
  }

  async createGroupPad(qs: GroupPad, throwOnEtherpadError = true) {
    this._checkVersion(`1.0.0`)
    return this._query(`createGroupPad`, qs, throwOnEtherpadError)
  }

  async listAllGroups(qs?: void, throwOnEtherpadError = true) {
    this._checkVersion(`1.0.0`)
    return this._query(`listAllGroups`, qs, throwOnEtherpadError)
  }

  ////////
  // AUTHOR
  ////////

  async createAuthor(qs: AuthorName, throwOnEtherpadError = true) {
    this._checkVersion(`1.0.0`)
    return this._query(`createAuthor`, qs, throwOnEtherpadError)
  }

  async createAuthorIfNotExistsFor(
    qs: AuthorMapper,
    throwOnEtherpadError = true,
  ) {
    this._checkVersion(`1.0.0`)
    return this._query(`createAuthorIfNotExistsFor`, qs, throwOnEtherpadError)
  }

  async listPadsOfAuthor(qs: Author, throwOnEtherpadError = true) {
    this._checkVersion(`1.0.0`)
    return this._query(`listPadsOfAuthor`, qs, throwOnEtherpadError)
  }

  async getAuthorName(qs: Author, throwOnEtherpadError = true) {
    this._checkVersion(`1.1.0`)
    return this._query(`getAuthorName`, qs, throwOnEtherpadError)
  }

  ////////
  // SESSION
  ////////

  async createSession(qs: AuthorSession, throwOnEtherpadError = true) {
    this._checkVersion(`1.0.0`)
    return this._query(`createSession`, qs, throwOnEtherpadError)
  }

  async deleteSession(qs: Session, throwOnEtherpadError = true) {
    this._checkVersion(`1.0.0`)
    return this._query(`deleteSession`, qs, throwOnEtherpadError)
  }

  async getSessionInfo(qs: Session, throwOnEtherpadError = true) {
    this._checkVersion(`1.0.0`)
    return this._query(`getSessionInfo`, qs, throwOnEtherpadError)
  }

  async listSessionsOfGroup(qs: Group, throwOnEtherpadError = true) {
    this._checkVersion(`1.0.0`)
    return this._query(`listSessionsOfGroup`, qs, throwOnEtherpadError)
  }

  async listSessionsOfAuthor(qs: Author, throwOnEtherpadError = true) {
    this._checkVersion(`1.0.0`)
    return this._query(`listSessionsOfAuthor`, qs, throwOnEtherpadError)
  }

  ////////
  // PAD CONTENT
  ////////

  async getText(qs: PadOptionalRev, throwOnEtherpadError = true) {
    this._checkVersion(`1.0.0`)
    return this._query(`getText`, qs, throwOnEtherpadError)
  }

  async setText(qs: PadText, throwOnEtherpadError = true) {
    this._checkVersion(`1.0.0`)
    return this._query(`setText`, qs, throwOnEtherpadError)
  }

  async appendText(qs: PadText, throwOnEtherpadError = true) {
    this._checkVersion(`1.2.13`)
    return this._query(`appendText`, qs, throwOnEtherpadError)
  }

  async getHTML(qs: PadOptionalRev, throwOnEtherpadError = true) {
    this._checkVersion(`1.0.0`)
    return this._query(`getHTML`, qs, throwOnEtherpadError)
  }

  async setHTML(qs: PadHtml, throwOnEtherpadError = true) {
    this._checkVersion(`1.0.0`)
    return this._query(`setHTML`, qs, throwOnEtherpadError)
  }

  async getAttributePool(qs: Pad, throwOnEtherpadError = true) {
    this._checkVersion(`1.2.8`)
    return this._query(`getAttributePool`, qs, throwOnEtherpadError)
  }

  async getRevisionChangeset(qs: PadOptionalRev, throwOnEtherpadError = true) {
    this._checkVersion(`1.2.8`)
    return this._query(`getRevisionChangeset`, qs, throwOnEtherpadError)
  }

  async createDiffHTML(qs: PadHtmlDiff, throwOnEtherpadError = true) {
    this._checkVersion(`1.2.7`)
    return this._query(`createDiffHTML`, qs, throwOnEtherpadError)
  }

  async restoreRevision(qs: PadRev, throwOnEtherpadError = true) {
    this._checkVersion(`1.2.11`)
    return this._query(`restoreRevision`, qs, throwOnEtherpadError)
  }

  ////////
  // CHAT
  ////////

  async getChatHistory(qs: PadChatHistory, throwOnEtherpadError = true) {
    this._checkVersion(`1.2.7`)
    return this._query(`getChatHistory`, qs, throwOnEtherpadError)
  }

  async getChatHead(qs: Pad, throwOnEtherpadError = true) {
    this._checkVersion(`1.2.7`)
    return this._query(`getChatHead`, qs, throwOnEtherpadError)
  }

  async appendChatMessage(qs: PadChatMessage, throwOnEtherpadError = true) {
    this._checkVersion(`1.2.12`)
    return this._query(`appendChatMessage`, qs, throwOnEtherpadError)
  }

  ////////
  // PAD
  ////////

  async createPad(qs: PadOptionalText, throwOnEtherpadError = true) {
    this._checkVersion(`1.0.0`)
    return this._query(`createPad`, qs, throwOnEtherpadError)
  }

  async getRevisionsCount(qs: Pad, throwOnEtherpadError = true) {
    this._checkVersion(`1.0.0`)
    return this._query(`getRevisionsCount`, qs, throwOnEtherpadError)
  }

  async getSavedRevisionsCount(qs: Pad, throwOnEtherpadError = true) {
    this._checkVersion(`1.2.11`)
    return this._query(`getSavedRevisionsCount`, qs, throwOnEtherpadError)
  }

  async listSavedRevisions(qs: Pad, throwOnEtherpadError = true) {
    this._checkVersion(`1.2.11`)
    return this._query(`listSavedRevisions`, qs, throwOnEtherpadError)
  }

  async saveRevision(qs: PadOptionalRev, throwOnEtherpadError = true) {
    this._checkVersion(`1.2.11`)
    return this._query(`saveRevision`, qs, throwOnEtherpadError)
  }

  async padUsersCount(qs: Pad, throwOnEtherpadError = true) {
    this._checkVersion(`1.0.0`)
    return this._query(`padUsersCount`, qs, throwOnEtherpadError)
  }

  async padUsers(qs: Pad, throwOnEtherpadError = true) {
    this._checkVersion(`1.1.0`)
    return this._query(`padUsers`, qs, throwOnEtherpadError)
  }

  async deletePad(qs: Pad, throwOnEtherpadError = true) {
    this._checkVersion(`1.0.0`)
    return this._query(`deletePad`, qs, throwOnEtherpadError)
  }

  async copyPad(qs: PadDestination, throwOnEtherpadError = true) {
    this._checkVersion(`1.2.8`)
    return this._query(`copyPad`, qs, throwOnEtherpadError)
  }

  async movePad(qs: PadDestination, throwOnEtherpadError = true) {
    this._checkVersion(`1.2.8`)
    return this._query(`movePad`, qs, throwOnEtherpadError)
  }

  async getReadOnlyID(qs: Pad, throwOnEtherpadError = true) {
    this._checkVersion(`1.0.0`)
    return this._query(`getReadOnlyID`, qs, throwOnEtherpadError)
  }

  async getPadID(qs: PadReadOnly, throwOnEtherpadError = true) {
    this._checkVersion(`1.2.10`)
    return this._query(`getPadID`, qs, throwOnEtherpadError)
  }

  async setPublicStatus(qs: PadPublicStatus, throwOnEtherpadError = true) {
    this._checkVersion(`1.0.0`)
    return this._query(`setPublicStatus`, qs, throwOnEtherpadError)
  }

  async getPublicStatus(qs: Pad, throwOnEtherpadError = true) {
    this._checkVersion(`1.0.0`)
    return this._query(`getPublicStatus`, qs, throwOnEtherpadError)
  }

  async setPassword(qs: PadPassword, throwOnEtherpadError = true) {
    this._checkVersion(`1.0.0`)
    return this._query(`setPassword`, qs, throwOnEtherpadError)
  }

  async isPasswordProtected(qs: Pad, throwOnEtherpadError = true) {
    this._checkVersion(`1.0.0`)
    return this._query(`isPasswordProtected`, qs, throwOnEtherpadError)
  }

  async listAuthorsOfPad(qs: Pad, throwOnEtherpadError = true) {
    this._checkVersion(`1.0.0`)
    return this._query(`listAuthorsOfPad`, qs, throwOnEtherpadError)
  }

  async getLastEdited(qs: Pad, throwOnEtherpadError = true) {
    this._checkVersion(`1.0.0`)
    return this._query(`getLastEdited`, qs, throwOnEtherpadError)
  }

  async sendClientsMessage(qs: PadMessage, throwOnEtherpadError = true) {
    this._checkVersion(`1.1.0`)
    return this._query(`sendClientsMessage`, qs, throwOnEtherpadError)
  }

  async checkToken(qs?: void, throwOnEtherpadError = true) {
    this._checkVersion(`1.2.0`)
    return this._query(`checkToken`, qs, throwOnEtherpadError)
  }

  ////////
  // PADS
  ////////

  async listAllPads(qs?: void, throwOnEtherpadError = true) {
    this._checkVersion(`1.2.1`)
    return this._query(`listAllPads`, qs, throwOnEtherpadError)
  }
}
