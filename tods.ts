// Copyright 2023 Ryan Brown

const env = typeof process === "object" ? nodeEnv() : browserEnv();
const base62charset =
  "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz"
    .split("")
    .map((c) => c.charCodeAt(0));

let debug = {
  log(msg:string) {},
  group(label:string) {},
  groupEnd() {},
};
// debug = console;

export async function ObjectToDesyncedString(
  data,
  type = "C",
  indexOffset = 0
) {
  const [decompressedSize, buf] = await DSMPEncode(data, indexOffset);
  const encodedSize =
    Base62_GetEncodedDataSize(buf.byteLength) +
    Base62_GetEncodedU32Size(decompressedSize) +
    3;
  let result = new Uint8Array(encodedSize + 10);
  let offset = 0;
  result[offset++] = 68;
  result[offset++] = 83;
  result[offset++] = type.charCodeAt(0);
  offset = Base62_WriteU32(decompressedSize, result, offset, result.byteLength);
  offset = Base62_WriteData(
    new Uint8Array(buf),
    result,
    offset,
    result.byteLength
  );
  if (offset != result.byteLength) {
    result = result.subarray(0, offset);
  }

  return new env.TextDecoder().decode(result);
}

/**
 * Writes a 32-bit unsigned integer in base62 format to a Uint8Array or
 * Array<number>.
 *
 * @param {number} u - The number to be converted to base62.
 * @param {Uint8Array|Array<number>} b62 - The array to store the base62 values.
 * @param {number} idx - The starting index in the b62 array.
 * @param {number} idxend - The ending index in the b62 array.
 * @return {number} - The index after writing the base62 value.
 */
function Base62_WriteU32(u, b62, idx, idxend) {
  idx += Base62_GetEncodedU32Size(u);
  const result = idx;
  do {
    if (idx >= idxend) throw new Error(`Data too long for Base62 encoding`);
    let v = u % 31;
    if (idx === result) {
      v += 31;
    }
    var c = base62charset[v];
    b62[--idx] = c;
    u = Math.floor(u / 31);
  } while (u > 0);
  return result;
}

/**
 * Writes the given data in Base62 encoding to the provided array starting at
 * the given index.
 *
 * @param {Uint8Array|Array<number>} data - The data to be encoded.
 * @param {Uint8Array|Array<number>} b62 - The array to store the Base62 encoded data.
 * @param {number} idx - The starting index in the array.
 * @param {number} idxend - The ending index in the array.
 * @return {number} The updated index after writing the Base62 encoded data.
 */
function Base62_WriteData(data, b62, idx, idxend) {
  var datalen = data.length;
  let checksum = 0;
  function addWord(word, bytes = 4) {
    let n = [0, 2, 3, 5, 6][bytes];
    idx += n;
    checksum = (checksum + word) % 4294967296;
    if (idx >= idxend) throw new Error(`Data too long for Base62 encoding`);
    for (let i = 0; i < n; i++) {
      const c = word % 62;
      b62[idx - i - 1] = base62charset[c];
      word = (word - c) / 62;
    }
  }
  let word = 0;
  for (var i = 0; i != datalen; i++) {
    word = word + data[i] * 256 ** (i % 4);
    if (i % 4 == 3) {
      addWord(word);
      word = 0;
    }
  }
  if (datalen % 4 != 0) {
    addWord(word, datalen % 4);
  }
  if (idx >= idxend) throw new Error(`Data too long for Base62 encoding`);
  b62[idx++] = base62charset[checksum % 62];
  return idx;
}

/**
 *
 * @param {*} data
 * @returns {Promise<[number, ArrayBuffer]>}
 */
async function DSMPEncode(data, indexOffset = 0) {
  const MP_FixZero = 0x00,
    MP_FixMap = 0x80,
    MP_FixArray = 0x90,
    MP_FixStr = 0xa0,
    MP_Nil = 0xc0,
    MP_False = 0xc2,
    MP_True = 0xc3,
    MP_Float32 = 0xca,
    MP_Float64 = 0xcb,
    MP_Uint8 = 0xcc,
    MP_Uint16 = 0xcd,
    MP_Uint32 = 0xce,
    MP_Uint64 = 0xcf,
    MP_Int8 = 0xd0,
    MP_Int16 = 0xd1,
    MP_Int32 = 0xd2,
    MP_Int64 = 0xd3,
    MP_Str8 = 0xd9,
    MP_Str16 = 0xda,
    MP_Str32 = 0xdb,
    MP_Array16 = 0xdc,
    MP_Array32 = 0xdd,
    MP_Map16 = 0xde,
    MP_Map32 = 0xdf;

  let ab = new ArrayBuffer(1024);
  let buf = new Uint8Array(ab);
  let view = new DataView(ab);
  const compressor = new env.CompressionStream("deflate");
  const writer = compressor.writable.getWriter();
  const textEncoder = new env.TextEncoder();
  let offset = 0;
  let totalWritten = 0;
  const result = env.streamToBytes(compressor.readable);

  async function flush() {
    let bytesToFlush = offset;
    totalWritten += bytesToFlush;
    offset = 0;
    const toWrite = new Uint8Array(ab, 0, bytesToFlush);
    // Don't re-use the buffer - node seems to keep using it even after
    // flushing it.
    ab = new ArrayBuffer(1024);
    buf = new Uint8Array(ab);
    view = new DataView(ab);
    await writer.ready;
    await writer.write(toWrite);
    await writer.ready;
  }
  /** @param {boolean} b */
  async function writeBoolean(b) {
    if (offset >= buf.byteLength) {
      await flush();
    }
    buf[offset++] = b ? MP_True : MP_False;
  }
  /** @param {number} n */
  async function writeNumber(n) {
    if (Number.isInteger(n)) {
      if (n >= 0) {
        if (n <= 0x7f) {
          if (offset >= buf.byteLength) {
            await flush();
          }
          buf[offset++] = n;
        } else if (n <= 0xff) {
          debug.log("MP_Uint8");
          if (offset + 1 >= buf.byteLength) {
            await flush();
          }
          buf[offset++] = MP_Uint8;
          buf[offset++] = n;
        } else if (n <= 0xffff) {
          debug.log("MP_Uint16");
          if (offset + 3 >= buf.byteLength) {
            await flush();
          }
          buf[offset++] = MP_Uint16;
          view.setUint16(offset, n, true);
          offset += 2;
        } else if (n <= 0xffffffff) {
          debug.log("MP_Uint32");
          if (offset + 5 >= buf.byteLength) {
            await flush();
          }
          buf[offset++] = MP_Uint32;
          view.setUint32(offset, n, true);
          offset += 4;
        } else {
          debug.log("MP_Uint64");
          if (offset + 9 >= buf.byteLength) {
            await flush();
          }
          buf[offset++] = MP_Uint64;
          view.setBigUint64(offset, BigInt(n), true);
        }
      } else {
        if (n >= -0x20) {
          if (offset >= buf.byteLength) {
            await flush();
          }
          buf[offset++] = n & 0xff;
        } else if (n >= -0x80) {
          debug.log("MP_Int8");
          if (offset + 1 >= buf.byteLength) {
            await flush();
          }
          buf[offset++] = MP_Int8;
          buf[offset++] = n;
        } else if (n >= -0x8000) {
          debug.log("MP_Int16");
          if (offset + 3 >= buf.byteLength) {
            await flush();
          }
          buf[offset++] = MP_Int16;
          view.setInt16(offset, n, true);
          offset += 2;
        } else if (n >= -0x80000000) {
          debug.log("MP_Int32");
          if (offset + 5 >= buf.byteLength) {
            await flush();
          }
          buf[offset++] = MP_Int32;
          view.setInt32(offset, n, true);
          offset += 4;
        } else {
          debug.log("MP_Int64");
          if (offset + 9 >= buf.byteLength) {
            await flush();
          }
          buf[offset++] = MP_Int64;
          view.setBigInt64(offset, BigInt(n), true);
          offset += 8;
        }
      }
    } else {
      debug.log("MP_Float64");
      if (offset + 9 >= buf.byteLength) {
        await flush();
      }
      buf[offset++] = MP_Float64;
      view.setFloat64(offset, n, true);
      offset += 8;
    }
  }
  async function writePackedNumber(n, debugName = "", partial = false) {
    if (n >= 0x80) {
      writePackedNumber(n >> 7, debugName, true);
    }
    let c = (n & 0x7f) << 1;
    if (partial) {
      c |= 1;
    }
    debug.log(`pack ${debugName} ${n} -> ${c}`);
    if (offset >= buf.byteLength) {
      await flush();
    }
    buf[offset++] = c;
  }
  /** @param {string|Uint8Array} s */
  async function writeString(s) {
    if (s.length < 32) {
      if (offset + 1 + s.length >= buf.byteLength) {
        await flush();
      }
      if (s instanceof Uint8Array) {
        debug.log("MP_FixStr");
        buf.set(s, offset + 1);
        buf[offset] = MP_FixStr + s.length;
        offset += 1 + s.length;
        return;
      }
      const strbuf = new Uint8Array(ab, offset + 1);
      const result = textEncoder.encodeInto(s, strbuf);
      if (result.written < 32 && result.read == s.length) {
        debug.log("MP_FixStr");
        buf[offset] = MP_FixStr + result.written;
        offset += 1 + result.written;
        return;
      }
    }
    const encoded = s instanceof Uint8Array ? s : textEncoder.encode(s);
    const sizesize =
      encoded.length < 0x7f
        ? 1
        : encoded.length < 0x7fff
        ? 2
        : encoded.length < 0x7fffffff
        ? 4
        : 8;
    if (sizesize > 4) {
      throw new Error("string too long");
    }
    if (offset + 1 + sizesize >= buf.byteLength) {
      await flush();
    }
    switch (sizesize) {
      case 1:
        debug.log("MP_Str8");
        buf[offset++] = MP_Str8;
        view.setUint8(offset++, encoded.length);
        break;
      case 2:
        debug.log("MP_Str16");
        buf[offset++] = MP_Str16;
        view.setUint16(offset, encoded.length, true);
        offset += 2;
        break;
      case 4:
        debug.log("MP_Str32");
        buf[offset++] = MP_Str32;
        view.setUint32(offset, encoded.length, true);
        offset += 4;
        break;
    }
    for (let i = 0; i < encoded.length; i++) {
      if (offset >= buf.byteLength) {
        await flush();
      }
      buf[offset++] = encoded[i];
    }
  }
  async function writeNil() {
    if (offset >= buf.byteLength) {
      await flush();
    }
    buf[offset++] = MP_Nil;
  }
  /** @param {Array} a */
  async function writeArray(a) {
    let headersize =
      a.length < 16
        ? 1
        : a.length < 0x10000
        ? 3
        : a.length < 0x100000000
        ? 5
        : 9;
    if (headersize > 5) {
      throw new Error(`array too long: ${a.length}`);
    }
    if (offset + headersize > buf.byteLength) {
      await flush();
    }
    switch (headersize) {
      case 1:
        debug.log("MP_FixArray");
        buf[offset++] = MP_FixArray + a.length;
        break;
      case 3:
        debug.log("MP_Array16");
        buf[offset++] = MP_Array16;
        view.setUint16(offset, a.length, true);
        offset += 2;
        break;
      case 5:
        debug.log("MP_Array32");
        buf[offset++] = MP_Array32;
        view.setUint32(offset, a.length, true);
        offset += 4;
        break;
    }
    let vacancy = 0n;
    for (let i = 0; i < a.length; i++) {
      if (a[i] === undefined) {
        vacancy |= 1n << BigInt(i);
      }
    }
    for (let i = 0; i < a.length; i++) {
      if (i % 8 == 0) {
        if (offset >= buf.byteLength) {
          await flush();
        }
        debug.log(`vacancy=${(vacancy&0xFFn).toString(2)}`);
        buf[offset++] = Number(vacancy & 0xFFn);
        vacancy >>= 8n;
      }
      if (a[i] !== undefined) {
        await writeValue(a[i]);
      }
    }
  }

  async function writeObject(o) {
    const t = new LuaTable(o, textEncoder, indexOffset);
    let encodedSize = 2 * t.lsizenode;
    if (encodedSize < 0) {
      throw new Error("invalid table");
    }

    if (t.array.length > 0) {
      encodedSize += 1;
    }

    if (encodedSize < 16) {
      debug.log("MP_FixMap");
      if (offset >= buf.byteLength) {
        await flush();
      }
      buf[offset++] = MP_FixMap + encodedSize;
    } else if (encodedSize < 0x10000) {
      debug.log("MP_Map16");
      if (offset + 2 >= buf.byteLength) {
        await flush();
      }
      buf[offset++] = MP_Map16;
      view.setUint16(offset, encodedSize, true);
      offset += 2;
    } else {
      debug.log("MP_Map32");
      if (offset + 4 >= buf.byteLength) {
        await flush();
      }
      buf[offset++] = MP_Map32;
      view.setUint32(offset, encodedSize, true);
      offset += 4;
    }
    let vacancy = t.vacancyBits;
    if (t.array.length > 0) {
      await writePackedNumber(t.array.length, "array_size");
    }
    await writePackedNumber(t.lastfree, "lastfree");

    await t.forEach(async (value, node, addVacancy) => {
      if (addVacancy) {
        if (offset >= buf.byteLength) {
          await flush();
        }
        debug.log(`vacancy=${(vacancy & 0xffn).toString(2)}`);
        buf[offset++] = Number(vacancy & 0xffn);
        vacancy >>= 8n;
      }
      if (value == null) {
        return;
      }
      node && debug.group(`value ${offset}`);
      await writeValue(value);
      if (node) {
        debug.groupEnd();
        debug.group(`key ${offset}`);
        await writeValue(node.key);
        debug.groupEnd();
        const encodedNext = node.next < 0 ? -2 * node.next + 1 : 2 * node.next;
        await writePackedNumber(encodedNext || 0, "next");
      }
    });
  }
  async function writeValue(v) {
    try {
      if (v == null) {
        debug.group("null");
        return writeNil();
      } else if (typeof v == "boolean") {
        debug.group(`${v}`);
        return writeBoolean(v);
      } else if (typeof v == "number") {
        debug.group(`${v}`);
        return writeNumber(v);
      } else if (typeof v == "string" || v instanceof Uint8Array) {
        debug.group(`string ${v.length}`);
        return writeString(v);
      }
      if (Array.isArray(v)) {
        debug.group(`array ${v.length}`);
        return writeArray(v);
      } else if (hasNumericKeys(v)) {
        const va :unknown[] = [];
        for (const k in v) {
          va[+k] = v[k];
        }
        debug.group(`array ${va.length}`);
        return writeArray(va);
      } else if (typeof v == "object") {
        debug.group(`object ${Object.keys(v).length}`);
        return writeObject(v);
      }
    } finally {
      debug.groupEnd();
    }
    throw new Error("Unsupported type: " + typeof v);
  }
  await writeValue(data);
  if (offset != 0) {
    await flush();
  }
  await writer.ready;
  await writer.close();
  return Promise.all([totalWritten, result]);
}

function Base62_GetEncodedU32Size(u) {
  for (var n = 1; ; n++) if (!(u = (u / 31) | 0)) return n;
}
function Base62_GetEncodedDataSize(datalen) {
  return (((datalen * 6 + 2) / 4) | 0) + 1;
} // with 1 byte checksum

function browserEnv() {
  return {
    TextEncoder,
    TextDecoder,
    // @ts-ignore
    CompressionStream,
    streamToBytes(stream) {
      return new Response(stream).arrayBuffer();
    },
  };
}

function nodeEnv() {
  const { arrayBuffer } = require("node:stream/consumers");
  const { TextDecoder, TextEncoder } = require("util");
  const { CompressionStream } = require("node:stream/web");
  return {
    TextEncoder,
    TextDecoder,
    CompressionStream,
    streamToBytes(stream) {
      return arrayBuffer(stream);
    },
  };
}

class TableNode<T> {
  key!: Uint8Array;
  value?: T;
  next = 0;
}

/******************************************************************************
 * Copyright (C) 1994-2023 Lua.org, PUC-Rio.
 *
 * Permission is hereby granted, free of charge, to any person obtaining
 * a copy of this software and associated documentation files (the
 * "Software"), to deal in the Software without restriction, including
 * without limitation the rights to use, copy, modify, merge, publish,
 * distribute, sublicense, and/or sell copies of the Software, and to
 * permit persons to whom the Software is furnished to do so, subject to
 * the following conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
 * IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
 * CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
 * TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
 * SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 ******************************************************************************/
class LuaTable<T = unknown> {
  array: T[];
  table: TableNode<T>[];
  vacancyBits: bigint;
  lsizenode: number;
  lastfree: number;

  /**
   * @param {{[key:number|string]:any}} o
   * @param {TextEncoder} encoder
   * @param {number} indexOffset Use 1 to treat numeric map keys as 1-based
   */
  constructor(o, encoder, indexOffset = 0) {
    this.array = [];
    this.vacancyBits = 0n;
    this.lsizenode = 0;
    this.lastfree = 0;

    /** @type {{key:Uint8Array, value:any, next:number}[]} */
    this.table = [];
    const remainingKeys = this.#splitKeys(o, indexOffset);
    this.#buildTable(remainingKeys, o, encoder);
    this.#calcVacancy();
  }

  /**
   *  @param {{[key:number|string]:any}} o
   *  @param {number} indexOffset
   */
  #splitKeys(o, indexOffset) {
    const allKeys = Object.keys(o);
    const filteredKeys: string[] = [];
    for (const k of allKeys) {
      const kn = (k as any as number) | 0;

      if ((k as any) == kn && kn >= indexOffset) {
        this.array[kn - indexOffset] = o[k];
      } else {
        filteredKeys.push(k);
      }
    }
    return filteredKeys;
  }

  /**
   * @param {string[]} remainingKeys
   * @param {{[key:number|string]:any}} o
   * @param {TextEncoder} encoder
   */
  #buildTable(keys, o, encoder) {
    this.lsizenode = Math.ceil(Math.log2(keys.length));
    const size = sizenode(this.lsizenode);
    this.table.length = size;
    this.lastfree = size;

    for (const key of keys) {
      const value = o[key];
      const encodedKey = encoder.encode(key);

      let mp = lmod(luaS_hash(encodedKey), size);
      if (!this.table[mp]) {
        this.table[mp] = new TableNode();
      } else {
        let f = this.#getfreepos();
        let othern = lmod(luaS_hash(this.table[mp].key), size);
        if (othern != mp) {
          // is colliding node out of its main position?
          // yes; move colliding node into free position
          while (othern + this.#gnext(othern) != mp) {
            othern += this.#gnext(othern);
          }
          this.table[othern].next = f - othern; // rechain to point to 'f'
          Object.assign(this.table[f], this.table[mp]); // copy colliding node into free pos
          if (this.#gnext(mp) != 0) {
            this.table[f].next += mp - f; // correct 'next'
            this.table[mp].next = 0; // now 'mp' is free
          }
          this.table[mp].value = undefined;
        } else {
          // colliding node is in its own main position
          // new node will go into free position
          if (this.#gnext(mp) != 0) {
            this.table[f].next = mp + this.#gnext(mp) - f; // chain new position
          }
          this.table[mp].next = f - mp;
          mp = f;
        }
      }
      this.table[mp].key = encodedKey;
      this.table[mp].value = value;
    }

    function luaS_hash(bytes) {
      const seed = 0x645dbfcd;
      let h = seed ^ bytes.length;
      let l = bytes.length;
      for (; l > 0; l--) {
        h = (h ^ ((h << 5) + (h >>> 2) + bytes[l - 1])) >>> 0;
      }
      return h;
    }

    function lmod(s, size) {
      return s & (size - 1);
    }
    function twoto(x) {
      return 1 << x;
    }
    function sizenode(lsizenode) {
      return twoto(lsizenode);
    }
  }

  #gnext(othern) {
    return this.table[othern].next ?? 0;
  }

  #getfreepos() {
    while (this.lastfree > 0) {
      this.lastfree--;
      if (!this.table[this.lastfree]) {
        this.table[this.lastfree] = new TableNode();
        return this.lastfree;
      }
    }
    throw new Error("out of nodes");
  }

  #calcVacancy() {
    this.vacancyBits = 0n;
    for (let i = 0n; i < this.array.length; i++) {
      if (this.array[i as any] == null) {
        this.vacancyBits |= 1n << i;
      }
    }
    for (let i = 0; i < this.table.length; i++) {
      if (!this.table[i]) {
        this.vacancyBits |= 1n << BigInt(i + this.array.length);
      }
    }
  }

  async forEach(f) {
    for (let i = 0; i < this.array.length; i++) {
      await f(this.array[i], undefined, i % 8 == 0);
    }
    for (let i = 0; i < this.table.length; i++) {
      const n = this.table[i];
      await f(n?.value, n, (i + this.array.length) % 8 == 0);
    }
  }
}

function hasNumericKeys(o) {
  for (const k in o) {
    // @ts-ignore
    if (k != (k | 0)) return false;
  }
  return true;
}