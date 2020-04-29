import {BaseJsonRpcType, JsonRpcType, IndexableJsonRpcType} from ".";
const toBigIntBE = require("bigint-buffer").toBigIntBE;

class Quantity extends BaseJsonRpcType {
  _nullable: boolean;
  public static from(value: number | bigint | string | Buffer, nullable = false) {
    const q = new _Quantity(value, nullable);
    q._nullable = nullable;
    return q;
  }
  public toString(): string {
    if (Buffer.isBuffer(this.value)) {
      let val = this.value.toString("hex").replace(/^(?:0+(.+?))?$/, "$1");

      if (val === "") {
        if (this._nullable) {
          return null;
        }
        // RPC Quantities must represent `0` as `0x0`
        val = "0";
      }
      return "0x" + val;
    } else {
      return super.toString();
    }
  }
  public toBigInt(): bigint {
    const value = this.value;

    // TODO: memoize this stuff
    if (Buffer.isBuffer(value)) {
      // Parsed as BE.

      // This doesn't handle negative values. We may need to add logic to handle
      // it because it is possible values returned from the VM could be negative
      // and stored in a buffer.

      const length = value.byteLength;
      if (length === 0) {
        return null;
      }
      // Buffers that are 6 bytes or less can be converted with built-in methods
      if (length <= 6) {
        return BigInt(value.readUIntBE(0, length));
      }

      let view: DataView;
      // Buffers that are 7 bytes need to be padded to 8 bytes
      if (length === 7) {
        const padded = new Uint8Array(8);
        // set byte 0 to 0, and bytes 1-8 to the value's 7 bytes:
        padded.set(value, 1);
        view = new DataView(padded.buffer);
      } else if (length === 8) {
        view = new DataView(value.buffer, value.byteOffset, length);
      } else {
        // TODO: toBigIntBE is a native lib with no pure JS fallback yet.
        return toBigIntBE(value);
        // TODO: handle bigint's stored as Buffers that are this big?
        // It's not too hard.
        // throw new Error(`Cannot convert Buffer of length ${length} to bigint!`);
      }
      return view.getBigUint64(0) as bigint;
    } else {
      return BigInt(this.value);
    }
  }
  valueOf(): bigint {
    return this.toBigInt();
  }
}
type $<T extends number | bigint | string | Buffer = number | bigint | string | Buffer> = {
  _nullable: boolean;
  new (value: T, nullable?: boolean): _Quantity & JsonRpcType<T>;
  from(value: T, nullable?: boolean): _Quantity & JsonRpcType<T>;
  toBigInt(): bigint;
  toBuffer(): Buffer;
};
const _Quantity = Quantity as $;

interface _Quantity<T = number | bigint | string | Buffer> {
  _nullable: boolean;
  constructor(value: T, nullable?: boolean): _Quantity;
  from(): _Quantity;
  toBigInt(): bigint;
  toBuffer(): Buffer;
}

export default _Quantity;