import compareVersions from 'compare-versions'
import createError from 'http-errors'
import request, { OptionsWithUri } from 'request-promise-native'
import { debuglog, inspect } from 'util'

import checkConfiguration from './check-configuration'
import { EtherpadConfiguration, EtherpadResponse } from './types'
import { buildEtherpadUrl, isConnectionRefused, isTimeout } from './utils'

const logger = debuglog(`etherpad`)

const err503Txt: string = `Etherpad is unavailable`

/*
  The API currently represented is https://etherpad.org/doc/v1.8.18/
*/

const etherpadErrorCodes = {
  1: 400, // wrong parameters     => BadRequest
  2: 500, // internal error       => InternalServerError
  3: 501, // no such function     => NotImplemented
  4: 400, // no or wrong API Key  => BadRequest
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
export interface PadSource {
  sourceID: string
}
export interface PadDestination extends PadSource {
  destinationID: string
  force?: boolean
}
export interface GroupPad extends Group {
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

export interface Pads {
  padIDs: Array<Pad["padID"]>
}

export interface Groups {
  groupIDs: Array<Group["groupID"]>
}

export interface Authors {
  authorIDs: Array<Author["authorID"]>
}

export interface AttributePool {
  pool: {
    numToAttrib: {[key: number]: Array<string>}
    attribToNum: {[key: string]: number}
    nextNum: number
  }
}

export type RevisionChangeset = string

export interface PadHtmlDiffResult {
  html: PadHtml["html"],
  authors: Array<Author["authorID"]>,
}

export interface ChatMessage {
  text: string,
  userId: string,
  time: number,
  userName: string,
}

export interface PadChatHistoryResult {
  messages: Array<ChatMessage>
}

export interface ChatHead {
  chatHead: number
}

export interface RevisionsCount {
  revisions: number
}

export interface SavedRevisionsCount {
  savedRevisions: 42
}

export interface SavedRevisions {
  savedRevisions: Array<number>
}

export interface PadUsersCount {
  padUsersCount: number
}

export interface PadUser {
  colorId: string,
  name: string,
  timestamp: number,
  id: string,
}

export interface PadUsers {
  padUsers: Array<PadUser>
}

export interface LastEdited {
  lastEdited: number,
}

export interface Stats {
  totalPads: number,
  totalSessions: number,
  totalActivePads: number,
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
    const checkedConfig = checkConfiguration(config)
    this._apiUrl = buildEtherpadUrl(checkedConfig)
    this._timeout = checkedConfig.timeout
    this._apiVersion = checkedConfig.apiVersion
    this._apiKey = checkedConfig.apiKey
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

  private async _query<Result>(
    method: string,
    qs: any = {},
    throwOnEtherpadError = true,
  ): Promise<Result> {
    const params: OptionsWithUri = this._getParams(method, qs)

    try {
      // EtherpadResponse
      const body = (await request(params)) as EtherpadResponse
      // body.code = +body.code
      if (body.code === 0) return body.data as Result
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
    return this._query<Group>(`createGroup`, qs, throwOnEtherpadError)
  }

  async createGroupIfNotExistsFor(
    qs: GroupMapper,
    throwOnEtherpadError = true,
  ) {
    this._checkVersion(`1.0.0`)
    return this._query<Group>(`createGroupIfNotExistsFor`, qs, throwOnEtherpadError)
  }

  async deleteGroup(qs: Group, throwOnEtherpadError = true) {
    this._checkVersion(`1.0.0`)
    return this._query<null>(`deleteGroup`, qs, throwOnEtherpadError)
  }

  async listPads(qs: Group, throwOnEtherpadError = true) {
    this._checkVersion(`1.0.0`)
    return this._query<Pads | null>(`listPads`, qs, throwOnEtherpadError)
  }

  async createGroupPad(qs: GroupPad, throwOnEtherpadError = true) {
    this._checkVersion(`1.0.0`)
    return this._query<null>(`createGroupPad`, qs, throwOnEtherpadError)
  }

  async listAllGroups(qs?: void, throwOnEtherpadError = true) {
    this._checkVersion(`1.1.0`)
    return this._query<Groups>(`listAllGroups`, qs, throwOnEtherpadError)
  }

  ////////
  // AUTHOR
  ////////

  async createAuthor(qs: AuthorName, throwOnEtherpadError = true) {
    this._checkVersion(`1.0.0`)
    return this._query<Author>(`createAuthor`, qs, throwOnEtherpadError)
  }

  async createAuthorIfNotExistsFor(
    qs: AuthorMapper,
    throwOnEtherpadError = true,
  ) {
    this._checkVersion(`1.0.0`)
    return this._query<Author>(`createAuthorIfNotExistsFor`, qs, throwOnEtherpadError)
  }

  async listPadsOfAuthor(qs: Author, throwOnEtherpadError = true) {
    this._checkVersion(`1.0.0`)
    return this._query<Pads | null>(`listPadsOfAuthor`, qs, throwOnEtherpadError)
  }

  async getAuthorName(qs: Author, throwOnEtherpadError = true) {
    this._checkVersion(`1.1.0`)
    return this._query<Required<AuthorName>>(`getAuthorName`, qs, throwOnEtherpadError)
  }

  ////////
  // SESSION
  ////////

  async createSession(qs: AuthorSession, throwOnEtherpadError = true) {
    this._checkVersion(`1.0.0`)
    return this._query<Session | null>(`createSession`, qs, throwOnEtherpadError)
  }

  async deleteSession(qs: Session, throwOnEtherpadError = true) {
    this._checkVersion(`1.0.0`)
    return this._query<null>(`deleteSession`, qs, throwOnEtherpadError)
  }

  async getSessionInfo(qs: Session, throwOnEtherpadError = true) {
    this._checkVersion(`1.0.0`)
    return this._query<AuthorSession | null>(`getSessionInfo`, qs, throwOnEtherpadError)
  }

  async listSessionsOfGroup(qs: Group, throwOnEtherpadError = true) {
    this._checkVersion(`1.0.0`)
    return this._query<{[sessionID: string]: AuthorSession} | null>(`listSessionsOfGroup`, qs, throwOnEtherpadError)
  }

  async listSessionsOfAuthor(qs: Author, throwOnEtherpadError = true) {
    this._checkVersion(`1.0.0`)
    return this._query<{[sessionID: string]: AuthorSession} | null>(`listSessionsOfAuthor`, qs, throwOnEtherpadError)
  }

  ////////
  // PAD CONTENT
  ////////

  async getText(qs: PadOptionalRev, throwOnEtherpadError = true) {
    this._checkVersion(`1.0.0`)
    return this._query<Pick<PadText, "text"> | null>(`getText`, qs, throwOnEtherpadError)
  }

  async setText(qs: PadText, throwOnEtherpadError = true) {
    this._checkVersion(`1.0.0`)
    return this._query<null>(`setText`, qs, throwOnEtherpadError)
  }

  async appendText(qs: PadText, throwOnEtherpadError = true) {
    this._checkVersion(`1.2.13`)
    return this._query<null>(`appendText`, qs, throwOnEtherpadError)
  }

  async getHTML(qs: PadOptionalRev, throwOnEtherpadError = true) {
    this._checkVersion(`1.0.0`)
    return this._query<Pick<PadHtml, "html">>(`getHTML`, qs, throwOnEtherpadError)
  }

  async setHTML(qs: PadHtml, throwOnEtherpadError = true) {
    this._checkVersion(`1.0.0`)
    return this._query<null>(`setHTML`, qs, throwOnEtherpadError)
  }

  async getAttributePool(qs: Pad, throwOnEtherpadError = true) {
    this._checkVersion(`1.2.8`)
    return this._query<AttributePool | null>(`getAttributePool`, qs, throwOnEtherpadError)
  }

  async getRevisionChangeset(qs: PadOptionalRev, throwOnEtherpadError = true) {
    this._checkVersion(`1.2.8`)
    return this._query<RevisionChangeset | null>(`getRevisionChangeset`, qs, throwOnEtherpadError)
  }

  async createDiffHTML(qs: PadHtmlDiff, throwOnEtherpadError = true) {
    this._checkVersion(`1.2.7`)
    return this._query<PadHtmlDiffResult | null>(`createDiffHTML`, qs, throwOnEtherpadError)
  }

  async restoreRevision(qs: PadRev, throwOnEtherpadError = true) {
    this._checkVersion(`1.2.11`)
    return this._query<null>(`restoreRevision`, qs, throwOnEtherpadError)
  }

  ////////
  // CHAT
  ////////

  async getChatHistory(qs: PadChatHistory, throwOnEtherpadError = true) {
    this._checkVersion(`1.2.7`)
    return this._query<PadChatHistoryResult | null>(`getChatHistory`, qs, throwOnEtherpadError)
  }

  async getChatHead(qs: Pad, throwOnEtherpadError = true) {
    this._checkVersion(`1.2.7`)
    return this._query<ChatHead | null>(`getChatHead`, qs, throwOnEtherpadError)
  }

  async appendChatMessage(qs: PadChatMessage, throwOnEtherpadError = true) {
    this._checkVersion(`1.2.12`)
    return this._query<null>(`appendChatMessage`, qs, throwOnEtherpadError)
  }

  ////////
  // PAD
  ////////

  async createPad(qs: PadOptionalText, throwOnEtherpadError = true) {
    this._checkVersion(`1.0.0`)
    return this._query<null>(`createPad`, qs, throwOnEtherpadError)
  }

  async getRevisionsCount(qs: Pad, throwOnEtherpadError = true) {
    this._checkVersion(`1.0.0`)
    return this._query<RevisionsCount | null>(`getRevisionsCount`, qs, throwOnEtherpadError)
  }

  async getSavedRevisionsCount(qs: Pad, throwOnEtherpadError = true) {
    this._checkVersion(`1.2.11`)
    return this._query<SavedRevisionsCount>(`getSavedRevisionsCount`, qs, throwOnEtherpadError)
  }

  async listSavedRevisions(qs: Pad, throwOnEtherpadError = true) {
    this._checkVersion(`1.2.11`)
    return this._query<SavedRevisions>(`listSavedRevisions`, qs, throwOnEtherpadError)
  }

  async saveRevision(qs: PadOptionalRev, throwOnEtherpadError = true) {
    this._checkVersion(`1.2.11`)
    return this._query<null>(`saveRevision`, qs, throwOnEtherpadError)
  }

  async padUsersCount(qs: Pad, throwOnEtherpadError = true) {
    this._checkVersion(`1.0.0`)
    return this._query<PadUsersCount>(`padUsersCount`, qs, throwOnEtherpadError)
  }

  async padUsers(qs: Pad, throwOnEtherpadError = true) {
    this._checkVersion(`1.1.0`)
    return this._query<PadUsers>(`padUsers`, qs, throwOnEtherpadError)
  }

  async deletePad(qs: Pad, throwOnEtherpadError = true) {
    this._checkVersion(`1.0.0`)
    return this._query<null>(`deletePad`, qs, throwOnEtherpadError)
  }

  async copyPad(qs: PadDestination, throwOnEtherpadError = true) {
    this._checkVersion(`1.2.8`)
    return this._query<null>(`copyPad`, qs, throwOnEtherpadError)
  }

  async copyPadWithoutHistory(qs: PadDestination, throwOnEtherpadError = true) {
    this._checkVersion(`1.2.15`)
    return this._query<null>(`copyPadWithoutHistory`, qs, throwOnEtherpadError)
  }

  async movePad(qs: PadDestination, throwOnEtherpadError = true) {
    this._checkVersion(`1.2.8`)
    return this._query<null>(`movePad`, qs, throwOnEtherpadError)
  }

  async getReadOnlyID(qs: Pad, throwOnEtherpadError = true) {
    this._checkVersion(`1.0.0`)
    return this._query<PadReadOnly | null>(`getReadOnlyID`, qs, throwOnEtherpadError)
  }

  async getPadID(qs: PadReadOnly, throwOnEtherpadError = true) {
    this._checkVersion(`1.2.10`)
    return this._query<Pad | null>(`getPadID`, qs, throwOnEtherpadError)
  }

  async setPublicStatus(qs: PadPublicStatus, throwOnEtherpadError = true) {
    this._checkVersion(`1.0.0`)
    return this._query<null>(`setPublicStatus`, qs, throwOnEtherpadError)
  }

  async getPublicStatus(qs: Pad, throwOnEtherpadError = true) {
    this._checkVersion(`1.0.0`)
    return this._query<Pick<PadPublicStatus, "publicStatus"> | null>(`getPublicStatus`, qs, throwOnEtherpadError)
  }

  /**
   * @deprecated This API method does not exist anymore at https://etherpad.org/doc/latest/
   */
  async setPassword(qs: PadPassword, throwOnEtherpadError = true) {
    this._checkVersion(`1.0.0`)
    return this._query(`setPassword`, qs, throwOnEtherpadError)
  }

  /**
   * @deprecated This API method does not exist anymore at https://etherpad.org/doc/latest/
   */
  async isPasswordProtected(qs: Pad, throwOnEtherpadError = true) {
    this._checkVersion(`1.0.0`)
    return this._query(`isPasswordProtected`, qs, throwOnEtherpadError)
  }

  async listAuthorsOfPad(qs: Pad, throwOnEtherpadError = true) {
    this._checkVersion(`1.0.0`)
    return this._query<Authors | null>(`listAuthorsOfPad`, qs, throwOnEtherpadError)
  }

  async getLastEdited(qs: Pad, throwOnEtherpadError = true) {
    this._checkVersion(`1.0.0`)
    return this._query<LastEdited | null>(`getLastEdited`, qs, throwOnEtherpadError)
  }

  async sendClientsMessage(qs: PadMessage, throwOnEtherpadError = true) {
    this._checkVersion(`1.1.0`)
    return this._query<{} | null>(`sendClientsMessage`, qs, throwOnEtherpadError)
  }

  async checkToken(qs?: void, throwOnEtherpadError = true) {
    this._checkVersion(`1.2.0`)
    return this._query<null>(`checkToken`, qs, throwOnEtherpadError)
  }

  ////////
  // PADS
  ////////

  async listAllPads(qs?: void, throwOnEtherpadError = true) {
    this._checkVersion(`1.2.1`)
    return this._query<Pads>(`listAllPads`, qs, throwOnEtherpadError)
  }

  ////////
  // GLOBAL
  ////////
  async getStats(qs?: void, throwOnEtherpadError = true) {
    this._checkVersion(`1.2.14`)
    return this._query<Stats>(`getStats`, qs, throwOnEtherpadError)
  }
}
