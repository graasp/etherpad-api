import request from 'request-promise-native'
import createError from 'http-errors'
import { inspect, debuglog } from 'util'
import compareVersions from 'compare-versions'

import { Configuration } from './types'
import getConfiguration from './get-configuration'
import { buildEtherpadUrl, createGetParams } from './utils'
import * as apiMethodsDescriptor from './api-methods'
import { stringify } from 'querystring'

const logger = debuglog(`etherpad`)

const err503Txt: string = `Etherpad is unavailable`
// http://etherpad.org/doc/v1.7.0/#index_response_format
const etherpadErrorCodes = {
  1: 422, // wrong parameters     => UnprocessableEntity
  2: 500, // internal error       => InternalServerError
  3: 501, // no such function     => NotImplemented
  4: 422, // no or wrong API Key  => UnprocessableEntity
}

interface groupID {
  groupID: string
}

interface authorID {
  authorID: string
}

interface SessionId {
  sessionID: string
}

export default function connect(config: Configuration): any {
  if (typeof config !== `object`) throw new Error(`configuration is mandatory`)
  config = getConfiguration(config)
  const ETHERPAD_URL: string = buildEtherpadUrl(config)
  const getParams = createGetParams(ETHERPAD_URL, config)

  async function queryEtherpad(
    method: string,
    qs: any = {},
    throwOnEtherpadError: boolean = true,
  ) {
    const params = getParams(method, qs)

    try {
      const response = await request(params)
      if (response.statusCode >= 400) {
        throw createError(response.statusCode, response.statusMessage)
      }
      const { body } = response
      body.code = +body.code

      if (body.code === 0) return body.data
      if (!throwOnEtherpadError) return body.data
      logger(`${method} doesn't work properly`, qs)
      const code = etherpadErrorCodes[body.code]
      const message = JSON.stringify(body.message)
      console.log(inspect(body, { colors: true }))
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

  const etherPadApi: any = {
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
    async deleteGroup(qs: groupID, throwOnEtherpadError: boolean = true) {
      checkVersion(`1.0.0`)
      return queryEtherpad(`deleteGroup`, qs, throwOnEtherpadError)
    },
    async listPads(qs: groupID, throwOnEtherpadError: boolean = true) {
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
    async listPadsOfAuthor(qs: authorID, throwOnEtherpadError: boolean = true) {
      checkVersion(`1.0.0`)
      return queryEtherpad(`listPadsOfAuthor`, qs, throwOnEtherpadError)
    },
    async getAuthorName(qs: authorID, throwOnEtherpadError: boolean = true) {
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
    async deleteSession(qs: SessionId, throwOnEtherpadError: boolean = true) {
      checkVersion(`1.0.0`)
      return queryEtherpad(`deleteSession`, qs, throwOnEtherpadError)
    },
    async getSessionInfo(qs: SessionId, throwOnEtherpadError: boolean = true) {
      checkVersion(`1.0.0`)
      return queryEtherpad(`getSessionInfo`, qs, throwOnEtherpadError)
    },
    async listSessionsOfGroup(
      qs: SessionId,
      throwOnEtherpadError: boolean = true,
    ) {
      checkVersion(`1.0.0`)
      return queryEtherpad(`listSessionsOfGroup`, qs, throwOnEtherpadError)
    },
    async listSessionsOfAuthor(
      qs: SessionId,
      throwOnEtherpadError: boolean = true,
    ) {
      checkVersion(`1.0.0`)
      return queryEtherpad(`listSessionsOfAuthor`, qs, throwOnEtherpadError)
    },

    ////////
    // PAD CONTENT
    ////////

    async getText(
      qs: {
        padID: string
        rev?: string
      },
      throwOnEtherpadError,
    ) {
      checkVersion(`1.0.0`)
      return queryEtherpad(`getText`, qs, throwOnEtherpadError)
    },
    async setText(
      qs: {
        padID: string
        text: string
      },
      throwOnEtherpadError,
    ) {
      checkVersion(`1.0.0`)
      return queryEtherpad(`setText`, qs, throwOnEtherpadError)
    },
    async appendText(
      qs: {
        padID: string
        text: string
      },
      throwOnEtherpadError,
    ) {
      checkVersion(`1.2.13`)
      return queryEtherpad(`appendText`, qs, throwOnEtherpadError)
    },
    async getHTML(
      qs: {
        padID: string
        rev?: string
      },
      throwOnEtherpadError,
    ) {
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
    async getAttributePool(qs: { padID: string }, throwOnEtherpadError) {
      checkVersion(`1.2.8`)
      return queryEtherpad(`getAttributePool`, qs, throwOnEtherpadError)
    },
    async getRevisionChangeset(
      qs: {
        padID: string
        rev?: string
      },
      throwOnEtherpadError,
    ) {
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
    async getChatHead(
      qs: {
        padID: string
      },
      throwOnEtherpadError: boolean = true,
    ) {
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

    async createPad(qs: any, throwOnEtherpadError: boolean = true) {
      checkVersion(`1.0.0`)
      return queryEtherpad(`createPad`, qs, throwOnEtherpadError)
      const params = [
        {
          name: `padID`,
        },
        {
          name: `text`,
          optional: true,
        },
      ]
    },
    async getRevisionsCount(qs: any, throwOnEtherpadError: boolean = true) {
      checkVersion(`1.0.0`)
      return queryEtherpad(`getRevisionsCount`, qs, throwOnEtherpadError)
      const params = [
        {
          name: `padID`,
        },
      ]
    },
    async getSavedRevisionsCount(
      qs: any,
      throwOnEtherpadError: boolean = true,
    ) {
      checkVersion(`1.2.11`)
      return queryEtherpad(`getSavedRevisionsCount`, qs, throwOnEtherpadError)
      const params = [
        {
          name: `padID`,
        },
      ]
    },
    async listSavedRevisions(qs: any, throwOnEtherpadError: boolean = true) {
      checkVersion(`1.2.11`)
      return queryEtherpad(`listSavedRevisions`, qs, throwOnEtherpadError)
      const params = [
        {
          name: `padID`,
        },
      ]
    },
    async saveRevision(qs: any, throwOnEtherpadError: boolean = true) {
      checkVersion(`1.2.11`)
      return queryEtherpad(`saveRevision`, qs, throwOnEtherpadError)
      const params = [
        {
          name: `padID`,
        },
        {
          name: `rev`,
          optional: true,
        },
      ]
    },
    async padUsersCount(qs: any, throwOnEtherpadError: boolean = true) {
      checkVersion(`1.0.0`)
      return queryEtherpad(`padUsersCount`, qs, throwOnEtherpadError)
      const params = [
        {
          name: `padID`,
        },
      ]
    },
    async padUsers(qs: any, throwOnEtherpadError: boolean = true) {
      checkVersion(`1.1.0`)
      return queryEtherpad(`padUsers`, qs, throwOnEtherpadError)
      const params = [
        {
          name: `padID`,
        },
      ]
    },
    async deletePad(qs: any, throwOnEtherpadError: boolean = true) {
      checkVersion(`1.0.0`)
      return queryEtherpad(`deletePad`, qs, throwOnEtherpadError)
      const params = [
        {
          name: `padID`,
        },
      ]
    },
    async copyPad(qs: any, throwOnEtherpadError: boolean = true) {
      checkVersion(`1.2.8`)
      return queryEtherpad(`copyPad`, qs, throwOnEtherpadError)
      const params = [
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
      ]
    },
    async movePad(qs: any, throwOnEtherpadError: boolean = true) {
      checkVersion(`1.2.8`)
      return queryEtherpad(`movePad`, qs, throwOnEtherpadError)
      const params = [
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
      ]
    },
    async getReadOnlyID(qs: any, throwOnEtherpadError: boolean = true) {
      checkVersion(`1.0.0`)
      return queryEtherpad(`getReadOnlyID`, qs, throwOnEtherpadError)
      const params = [
        {
          name: `padID`,
        },
      ]
    },
    async getPadID(qs: any, throwOnEtherpadError: boolean = true) {
      checkVersion(`1.2.10`)
      return queryEtherpad(`getPadID`, qs, throwOnEtherpadError)
      const params = [
        {
          name: `readOnlyID`,
        },
      ]
    },
    async setPublicStatus(qs: any, throwOnEtherpadError: boolean = true) {
      checkVersion(`1.0.0`)
      return queryEtherpad(`setPublicStatus`, qs, throwOnEtherpadError)
      const params = [
        {
          name: `readOnlyID`,
        },
        {
          name: `publicStatus`,
        },
      ]
    },
    async getPublicStatus(qs: any, throwOnEtherpadError: boolean = true) {
      checkVersion(`1.0.0`)
      return queryEtherpad(`getPublicStatus`, qs, throwOnEtherpadError)
      const params = [
        {
          name: `padID`,
        },
      ]
    },
    async setPassword(qs: any, throwOnEtherpadError: boolean = true) {
      checkVersion(`1.0.0`)
      return queryEtherpad(`setPassword`, qs, throwOnEtherpadError)
      const params = [
        {
          name: `padID`,
        },
        {
          name: `password`,
        },
      ]
    },
    async isPasswordProtected(qs: any, throwOnEtherpadError: boolean = true) {
      checkVersion(`1.0.0`)
      return queryEtherpad(`isPasswordProtected`, qs, throwOnEtherpadError)
      const params = [
        {
          name: `padID`,
        },
      ]
    },
    async listAuthorsOfPad(qs: any, throwOnEtherpadError: boolean = true) {
      checkVersion(`1.0.0`)
      return queryEtherpad(`listAuthorsOfPad`, qs, throwOnEtherpadError)
      const params = [
        {
          name: `padID`,
        },
      ]
    },
    async getLastEdited(qs: any, throwOnEtherpadError: boolean = true) {
      checkVersion(`1.0.0`)
      return queryEtherpad(`getLastEdited`, qs, throwOnEtherpadError)
      const params = [
        {
          name: `padID`,
        },
      ]
    },
    async sendClientsMessage(qs: any, throwOnEtherpadError: boolean = true) {
      checkVersion(`1.1.0`)
      return queryEtherpad(`sendClientsMessage`, qs, throwOnEtherpadError)
      const params = [
        {
          name: `padID`,
        },
        {
          name: `msg`,
        },
      ]
    },
    async checkToken(qs: any, throwOnEtherpadError: boolean = true) {
      checkVersion(`1.2.0`)
      return queryEtherpad(`checkToken`, qs, throwOnEtherpadError)
      const params = []
    },
  }

  return Object.freeze(etherPadApi)
}
