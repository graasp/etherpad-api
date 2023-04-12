import { URL } from 'url';

import { EtherpadConfiguration } from './types';

export function isString(text: any): text is string {
  return typeof text === `string` && text.length > 0;
}

export function isApiKey(apiKey: string): boolean {
  return /^[a-f\d]{64}$/.test(apiKey);
}

export function isVersion(version: string): boolean {
  return /^\d+\.\d+\.\d+$/.test(version);
}

export function isInteger(num: any): num is number {
  return Number.isInteger(num);
}

export function isUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

// can test both ETIMEDOUT & ESOCKETTIMEDOUT
export function isTimeout(error: any): boolean {
  return /TIMEDOUT/.test((error.error && error.error.code) || error.code);
}

export function isConnectionRefused(error: any): boolean {
  return /ECONNREFUSED/.test((error.error && error.error.code) || error.code);
}

export function buildEtherpadUrl(
  config: Required<EtherpadConfiguration>,
): string {
  const ETHERPAD_URL: URL = new URL(config.url);
  ETHERPAD_URL.pathname = `api/${config.apiVersion}`;
  return ETHERPAD_URL.toString();
}
