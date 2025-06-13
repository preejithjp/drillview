export type TPrimitives = string | number | boolean | null;

export type TObject = Record<string, TPrimitives>;

type JSONValue = string | number | boolean | { [x: string]: JSONValue } | Array<JSONValue>;

export interface JSONObject {
  [x: string]: JSONValue;
}

export type JSONArray = Array<JSONObject>;

export enum WebStorageKeys {
  AUTH = 'authInfo',
  THEME = 'theme',
}
