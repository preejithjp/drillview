import { JSONObject, WebStorageKeys } from '@/interfaces/common.interfaces';
import { JWTUserData } from '../../server/interfaces/auth.interfaces';
import { RunTimeConfig } from '@/interfaces/state.interfaces';
import Logger from './logger';
import { store } from '@/main';
import { name as appName } from '../../package.json';

const encryptionSecret = `${appName}-secret-code`;
const webStorageEncryptionkey = `${appName}_storage_`;

export function encryptString(value: string): string {
  return btoa(btoa(encryptionSecret) + btoa(value));
}

export function decryptString(value: string): string {
  return atob(atob(value)?.split(btoa(encryptionSecret))?.[1]);
}

export function saveToWebStorage(key: WebStorageKeys, value: unknown) {
  const lKey = webStorageEncryptionkey + encryptString(key);
  localStorage.setItem(lKey, encryptString(JSON.stringify(value)));
}

export function readFromWebStorage(key: WebStorageKeys) {
  const lKey = webStorageEncryptionkey + encryptString(key);
  if (localStorage[lKey]) {
    return JSON.parse(decryptString(localStorage[lKey]));
  } else {
    return '';
  }
}

export function removeFromWebStorage(key: WebStorageKeys) {
  const lKey = webStorageEncryptionkey + encryptString(key);
  if (localStorage[lKey]) {
    localStorage.removeItem(lKey);
  }
}

export function getInitials(name?: string) {
  if (!name) return '';
  const initials = name
    .split(' ')
    .map((word) => word[0]?.toUpperCase())
    .join('');
  return initials;
}

export function parseJwt(token: string = ''): JWTUserData | undefined {
  const base64Url = token.split('.')[1] || '';
  const base64 = base64Url.replace('-', '+').replace('_', '/');
  const decoded = atob(base64);
  return decoded ? JSON.parse(decoded) : undefined;
}

export function valueIsInEnum<E>(value: string | number, enumeration: Record<string | number | symbol, E>): boolean {
  if (typeof value === 'number') {
    return value in enumeration;
  } else {
    return Object.values(enumeration).includes(value as E);
  }
}

export function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function runtimeDataBindng() {
  // loading env variables into runtime store
  // code placement here is needed for proper working of production build
  // DO NOT MOVE THIS CODE WITHOUT PROPER TESTING OF DEV AND PROD BUILDS

  const viteEnv = import.meta.env;
  if (viteEnv && viteEnv.MODE === 'development') {
    // dev runtime data allocation
    // Vue only supports "VITE_APP_" prefix env vars
    // Before compilation adding vars with "VITE_APP_" Prefix
    // After compilation removing "VITE_APP_" Prefix
    const rtc: JSONObject = {};
    Object.keys(viteEnv).forEach((e) => {
      const key: keyof RunTimeConfig = (e.split('VITE_APP_').pop() || '') as keyof RunTimeConfig;
      rtc[key] = viteEnv[e] || '';
    });
    store.runtimeConfig = rtc as unknown as RunTimeConfig;
    // dev runtime data allocation
  } else {
    // production runtime data allocation
    if (document.body && document.body.getAttribute('data-config')) {
      let runtimeData = {};
      try {
        runtimeData = JSON.parse(document.body.getAttribute('data-config') || '{}');
      } catch (e) {
        Logger.Error('Runtimedata Binding Error: ' + e);
      }
      if (runtimeData && Object.keys(runtimeData).length) {
        store.runtimeConfig = runtimeData as RunTimeConfig;
        document.body.setAttribute('data-config', '');
      }
    }
    // production runtime data allocation
  }
}
