import { Binary } from 'bson';
import { v4 as uuidv4 } from 'uuid';

export default class BinaryUtils {
  static convertUuidToBinary(uuid?: string): Binary {
    const finalUuid = uuid || uuidv4();
    const uuidBuffer = Buffer.from(finalUuid.replace(/-/g, ''), 'hex');
    return new Binary(uuidBuffer, Binary.SUBTYPE_UUID);
  }
  static uuidModelType = {
    type: Buffer,
    set: (value: Buffer | Binary) => {
      // Ensure Binary subtype 04 for UUIDs using the constant
      if (value instanceof Binary) return value;
      return new Binary(value, Binary.SUBTYPE_UUID);
    },
  };

  static convertBinaryToUuid(binary: Binary | Buffer): string {
    if (!binary) {
      throw new Error('Invalid Binary object passed to convertBinaryToUuid');
    }

    // Ensure we have a Buffer
    let buffer: Buffer;
    if (binary instanceof Binary) {
      buffer = Buffer.from(binary.buffer); // Convert Uint8Array to Buffer
    } else if (Buffer.isBuffer(binary)) {
      buffer = binary;
    } else {
      throw new Error('Invalid input: Expected a Binary or Buffer');
    }

    const hexString = buffer.toString('hex');
    return [
      hexString.substring(0, 8), // 8 characters for time_low
      hexString.substring(8, 12), // 4 characters for time_mid
      hexString.substring(12, 16), // 4 characters for time_high_and_version
      hexString.substring(16, 20), // 4 characters for clock_seq_and_reserved
      hexString.substring(20), // 12 characters for node
    ].join('-');
  }

  static isValidUUID(uuid: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  }

  static convertArrayOfUuidsToBinary(uuids: string[]): Binary[] {
    return uuids.map((uuid) => this.convertUuidToBinary(uuid));
  }
}
