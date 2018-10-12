import { ApiMethodMap } from '../types'

import groups from './groups'
import author from './author'
import session from './session'
import padContent from './pad-content'
import chat from './chat'
import pad from './pad'
import pads from './pads'

const api: ApiMethodMap = {
  ...groups,
  ...author,
  ...session,
  ...padContent,
  ...chat,
  ...pad,
  ...pads,
}

export default api
