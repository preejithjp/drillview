import { encode, decode } from '@msgpack/msgpack';

export type BinaryResponse = ArrayBufferLike | ArrayLike<number> | ArrayBufferView<ArrayBufferLike>;

export class BinaryUtils {
  static Serialize(object: unknown) {
    const encoded: Uint8Array = encode(object);
    return encoded;
  }

  static Deserialize<R>(object: BinaryResponse): R {
    const decoded = decode(object) as R;
    return decoded;
  }
}
