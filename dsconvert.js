/*
   Copyright (C) 2023-2024 Stage Games Inc.

   Permission is hereby granted, free of charge, to any person obtaining a copy of this
   software and associated documentation files (the "Software"), to deal in the Software
   without restriction, including without limitation the rights to use, copy, modify, merge,
   publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons
   to whom the Software is furnished to do so, subject to the following conditions:

   The above copyright notice and this permission notice shall be included in all
   copies or substantial portions of the Software.

   THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,
   INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR
   PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
   LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
   TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
   USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

export function DesyncedStringToObject(str, info)
{
	if (str.length > 10*1024*1024) throw new Error("Input string is over 10MB"); // refuse strings larger than 10MB
	var b62 = new Uint8Array(str.length), idx = 0, idxend = b62.length;
	for (var i = 0, j = str.length; i != j; i++) b62[i] = str.charCodeAt(i);

	// Custom Base62 format for decoding Lua tables from strings (there is no Base62 standard so the way bytes and lengths are encoded is original)
	const Base62_CharToByte = [255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,0,1,2,3,4,5,6,7,8,9,255,255,255,255,255,255,255,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,255,255,255,255,255,255,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255];
	function Base62_IsValidChar(c) { return Base62_CharToByte[c] != 255; }
	function Base62_GetEncodedU32Size(u) { for (var n = 1; ; n++) if (!(u = (u/31)|0)) return n; }
	function Base62_ReadU32(b62, idx, idxend)
	{
		for (var u = 0; idx != idxend;)
		{
			var c = b62[idx++], b = Base62_CharToByte[c];
			if (b == 255) { if (c <= 32) continue; return 0; } // allow whitespace, abort on unknown character
			u = (u * 31) + (b % 31);
			if (b >= 31) return u; // reached end marker
		}
		return 0;
	}
	function Base62_ReadData(b62, idx, idxend)
	{
		if (idx >= idxend) return;
		var idxchecksum = (idxend - 1);
		var data = new Uint8Array((((idxchecksum - idx) * 4) / 6)|0); // max data length if containing no whitespace
		var datalen = 0, chksum = 0;
		while (idx != idxchecksum)
		{
			var bits = 0, i = 0;
			while (i != 6 && idx != idxchecksum)
			{
				var c = b62[idx++], b = Base62_CharToByte[c];
				if (b == 255) { if (c <= 32) continue; return; } // allow whitespace, abort on unknown character
				bits = (bits * 62) + b;
				i++;
			}
			chksum = ((chksum + bits) % 4294967296);
			switch (i)
			{
				case 6: data[datalen++] = (bits & 0xFF); bits >>= 8; /* fall through */
				case 5: data[datalen++] = (bits & 0xFF); bits >>= 8; /* fall through */
				case 3: data[datalen++] = (bits & 0xFF); bits >>= 8; /* fall through */
				case 2: data[datalen++] = (bits & 0xFF); break;
			}
		}
		if (Base62_CharToByte[b62[idx]] != (chksum % 62)) return; // validate checksum
		return (datalen == data.length ? data : data.slice(0, datalen));
	}

	while (idx < idxend && !Base62_IsValidChar(b62[idx])) idx++;
	while (idxend > idx && !Base62_IsValidChar(b62[idxend-1])) idxend--;
	if ((idxend - idx) < 5) throw new Error("Input string is too short");
	if (b62[idx] != 68 || b62[idx+1] != 83) throw new Error("Input string does not begin with the prefix 'DS'");
	if (info) info.type = String.fromCharCode(b62[idx+2]);

	var decompressLen = Base62_ReadU32(b62, (idx += 3), idxend);
	if (decompressLen > 20*1024*1024) throw new Error("Input data is over 20MB"); // refuse decompressing to more than 20MB

	// If decompressLen is 0 the data was stored without compression
	idx += Base62_GetEncodedU32Size(decompressLen);
	var buf = Base62_ReadData(b62, idx, idxend);
	if (decompressLen && buf)
	{
		/** @license zlib.js 2012 - imaya [ https://github.com/imaya/zlib.js ] The MIT License */
		var Zlib = {}; (function() {'use strict';var l=void 0,aa=this;function r(c,d){var a=c.split("."),b=aa;!(a[0]in b)&&b.execScript&&b.execScript("var "+a[0]);for(var e;a.length&&(e=a.shift());)!a.length&&d!==l?b[e]=d:b=b[e]?b[e]:b[e]={}};var t="undefined"!==typeof Uint8Array&&"undefined"!==typeof Uint16Array&&"undefined"!==typeof Uint32Array&&"undefined"!==typeof DataView;function v(c){var d=c.length,a=0,b=Number.POSITIVE_INFINITY,e,f,g,h,k,m,n,p,s,x;for(p=0;p<d;++p)c[p]>a&&(a=c[p]),c[p]<b&&(b=c[p]);e=1<<a;f=new (t?Uint32Array:Array)(e);g=1;h=0;for(k=2;g<=a;){for(p=0;p<d;++p)if(c[p]===g){m=0;n=h;for(s=0;s<g;++s)m=m<<1|n&1,n>>=1;x=g<<16|p;for(s=m;s<e;s+=k)f[s]=x;++h}++g;h<<=1;k<<=1}return[f,a,b]};function w(c,d){this.g=[];this.h=32768;this.d=this.f=this.a=this.l=0;this.input=t?new Uint8Array(c):c;this.m=!1;this.i=y;this.r=!1;if(d||!(d={}))d.index&&(this.a=d.index),d.bufferSize&&(this.h=d.bufferSize),d.bufferType&&(this.i=d.bufferType),d.resize&&(this.r=d.resize);switch(this.i){case A:this.b=32768;this.c=new (t?Uint8Array:Array)(32768+this.h+258);break;case y:this.b=0;this.c=new (t?Uint8Array:Array)(this.h);this.e=this.z;this.n=this.v;this.j=this.w;break;default:throw Error("invalid inflate mode"); }}var A=0,y=1,B={t:A,s:y};w.prototype.k=function(){for(;!this.m;){var c=C(this,3);c&1&&(this.m=!0);c>>>=1;switch(c){case 0:var d=this.input,a=this.a,b=this.c,e=this.b,f=d.length,g=l,h=l,k=b.length,m=l;this.d=this.f=0;if(a+1>=f)throw Error("invalid uncompressed block header: LEN");g=d[a++]|d[a++]<<8;if(a+1>=f)throw Error("invalid uncompressed block header: NLEN");h=d[a++]|d[a++]<<8;if(g===~h)throw Error("invalid uncompressed block header: length verify");if(a+g>d.length)throw Error("input buffer is broken");switch(this.i){case A:for(;e+g>b.length;){m=k-e;g-=m;if(t)b.set(d.subarray(a,a+m),e),e+=m,a+=m;else for(;m--;)b[e++]=d[a++];this.b=e;b=this.e();e=this.b}break;case y:for(;e+g>b.length;)b=this.e({p:2});break;default:throw Error("invalid inflate mode");}if(t)b.set(d.subarray(a,a+g),e),e+=g,a+=g;else for(;g--;)b[e++]=d[a++];this.a=a;this.b=e;this.c=b;break;case 1:this.j(ba,ca);break;case 2:for(var n=C(this,5)+257,p=C(this,5)+1,s=C(this,4)+4,x=new (t?Uint8Array:Array)(D.length),S=l,T=l,U=l,u=l,M=l,F=l,z=l,q=l,V=l,q=0;q<s;++q)x[D[q]]=C(this,3);if(!t){q=s;for(s=x.length;q<s;++q)x[D[q]]=0}S=v(x);u=new (t?Uint8Array:Array)(n+p);q=0;for(V=n+p;q<V;)switch(M=E(this,S),M){case 16:for(z=3+C(this,2);z--;)u[q++]=F;break;case 17:for(z=3+C(this,3);z--;)u[q++]=0;F=0;break;case 18:for(z=11+C(this,7);z--;)u[q++]=0;F=0;break;default:F=u[q++]=M}T=t?v(u.subarray(0,n)):v(u.slice(0,n));U=t?v(u.subarray(n)):v(u.slice(n));this.j(T,U);break;default:throw Error("unknown BTYPE: "+c);}}return this.n()};var G=[16,17,18,0,8,7,9,6,10,5,11,4,12,3,13,2,14,1,15],D=t?new Uint16Array(G):G,H=[3,4,5,6,7,8,9,10,11,13,15,17,19,23,27,31,35,43,51,59,67,83,99,115,131,163,195,227,258,258,258],I=t?new Uint16Array(H):H,J=[0,0,0,0,0,0,0,0,1,1,1,1,2,2,2,2,3,3,3,3,4,4,4,4,5,5,5,5,0,0,0],K=t?new Uint8Array(J):J,L=[1,2,3,4,5,7,9,13,17,25,33,49,65,97,129,193,257,385,513,769,1025,1537,2049,3073,4097,6145,8193,12289,16385,24577],da=t?new Uint16Array(L):L,ea=[0,0,0,0,1,1,2,2,3,3,4,4,5,5,6,6,7,7,8,8,9,9,10,10,11,11,12,12,13,13],N=t?new Uint8Array(ea):ea,O=new (t?Uint8Array:Array)(288),P,fa;P=0;for(fa=O.length;P<fa;++P)O[P]=143>=P?8:255>=P?9:279>=P?7:8;var ba=v(O),Q=new (t?Uint8Array:Array)(30),R,ga;R=0;for(ga=Q.length;R<ga;++R)Q[R]=5;var ca=v(Q);function C(c,d){for(var a=c.f,b=c.d,e=c.input,f=c.a,g=e.length,h;b<d;){if(f>=g)throw Error("input buffer is broken");a|=e[f++]<<b;b+=8}h=a&(1<<d)-1;c.f=a>>>d;c.d=b-d;c.a=f;return h}function E(c,d){for(var a=c.f,b=c.d,e=c.input,f=c.a,g=e.length,h=d[0],k=d[1],m,n;b<k&&!(f>=g);)a|=e[f++]<<b,b+=8;m=h[a&(1<<k)-1];n=m>>>16;if(n>b)throw Error("invalid code length: "+n);c.f=a>>n;c.d=b-n;c.a=f;return m&65535}w.prototype.j=function(c,d){var a=this.c,b=this.b;this.o=c;for(var e=a.length-258,f,g,h,k;256!==(f=E(this,c));)if(256>f)b>=e&&(this.b=b,a=this.e(),b=this.b),a[b++]=f;else{g=f-257;k=I[g];0<K[g]&&(k+=C(this,K[g]));f=E(this,d);h=da[f];0<N[f]&&(h+=C(this,N[f]));b>=e&&(this.b=b,a=this.e(),b=this.b);for(;k--;)a[b]=a[b++-h]}for(;8<=this.d;)this.d-=8,this.a--;this.b=b};w.prototype.w=function(c,d){var a=this.c,b=this.b;this.o=c;for(var e=a.length,f,g,h,k;256!==(f=E(this,c));)if(256>f)b>=e&&(a=this.e(),e=a.length),a[b++]=f;else{g=f-257;k=I[g];0<K[g]&&(k+=C(this,K[g]));f=E(this,d);h=da[f];0<N[f]&&(h+=C(this,N[f]));b+k>e&&(a=this.e(),e=a.length);for(;k--;)a[b]=a[b++-h]}for(;8<=this.d;)this.d-=8,this.a--;this.b=b};w.prototype.e=function(){var c=new (t?Uint8Array:Array)(this.b-32768),d=this.b-32768,a,b,e=this.c;if(t)c.set(e.subarray(32768,c.length));else{a=0;for(b=c.length;a<b;++a)c[a]=e[a+32768]}this.g.push(c);this.l+=c.length;if(t)e.set(e.subarray(d,d+32768));else for(a=0;32768>a;++a)e[a]=e[d+a];this.b=32768;return e};w.prototype.z=function(c){var d,a=this.input.length/this.a+1|0,b,e,f,g=this.input,h=this.c;c&&("number"===typeof c.p&&(a=c.p),"number"===typeof c.u&&(a+=c.u));2>a?(b=(g.length-this.a)/this.o[2],f=258*(b/2)|0,e=f<h.length?h.length+f:h.length<<1):e=h.length*a;t?(d=new Uint8Array(e),d.set(h)):d=h;return this.c=d};w.prototype.n=function(){var c=0,d=this.c,a=this.g,b,e=new (t?Uint8Array:Array)(this.l+(this.b-32768)),f,g,h,k;if(0===a.length)return t?this.c.subarray(32768,this.b):this.c.slice(32768,this.b);f=0;for(g=a.length;f<g;++f){b=a[f];h=0;for(k=b.length;h<k;++h)e[c++]=b[h]}f=32768;for(g=this.b;f<g;++f)e[c++]=d[f];this.g=[];return this.buffer=e};w.prototype.v=function(){var c,d=this.b;t?this.r?(c=new Uint8Array(d),c.set(this.c.subarray(0,d))):c=this.c.subarray(0,d):(this.c.length>d&&(this.c.length=d),c=this.c);return this.buffer=c};function W(c,d){var a,b;this.input=c;this.a=0;if(d||!(d={}))d.index&&(this.a=d.index),d.verify&&(this.A=d.verify);a=c[this.a++];b=c[this.a++];switch(a&15){case ha:this.method=ha;break;default:throw Error("unsupported compression method");}if(0!==((a<<8)+b)%31)throw Error("invalid fcheck flag:"+((a<<8)+b)%31);if(b&32)throw Error("fdict flag is not supported");this.q=new w(c,{index:this.a,bufferSize:d.bufferSize,bufferType:d.bufferType,resize:d.resize})}W.prototype.k=function(){var c=this.input,d,a;d=this.q.k();this.a=this.q.a;if(this.A){a=(c[this.a++]<<24|c[this.a++]<<16|c[this.a++]<<8|c[this.a++])>>>0;var b=d;if("string"===typeof b){var e=b.split(""),f,g;f=0;for(g=e.length;f<g;f++)e[f]=(e[f].charCodeAt(0)&255)>>>0;b=e}for(var h=1,k=0,m=b.length,n,p=0;0<m;){n=1024<m?1024:m;m-=n;do h+=b[p++],k+=h;while(--n);h%=65521;k%=65521}if(a!==(k<<16|h)>>>0)throw Error("invalid adler-32 checksum");}return d};var ha=8;r("Zlib.Inflate",W);r("Zlib.Inflate.prototype.decompress",W.prototype.k);var X={ADAPTIVE:B.s,BLOCK:B.t},Y,Z,$,ia;if(Object.keys)Y=Object.keys(X);else for(Z in Y=[],$=0,X)Y[$++]=Z;$=0;for(ia=Y.length;$<ia;++$)Z=Y[$],r("Zlib.Inflate.BufferType."+Z,X[Z]);}).call(Zlib);
		try { buf = (new Zlib.Zlib.Inflate(buf, { 'bufferSize': decompressLen, 'verify': true })).decompress(); } catch { throw new Error("Error during decompression of input data"); }
	}
	if (!buf) throw new Error("Failed to decode input string");

	// Deserialize byte array
	const v = new DataView(buf.buffer);
	const utf8 = new (typeof process === 'object' ? require("util").TextDecoder : TextDecoder)(); // default 'utf-8' or 'utf8'
	var p = 0;

	const
		MP_FixZero   = 0x00, MP_FixMap    = 0x80, MP_FixArray  = 0x90, MP_FixStr    = 0xa0,
		MP_Nil       = 0xc0, MP_False     = 0xc2, MP_True      = 0xc3,
		MP_Float32   = 0xca, MP_Float64   = 0xcb,
		MP_Uint8     = 0xcc, MP_Uint16    = 0xcd, MP_Uint32    = 0xce, MP_Uint64    = 0xcf,
		MP_Int8      = 0xd0, MP_Int16     = 0xd1, MP_Int32     = 0xd2, MP_Int64     = 0xd3,
		MP_Str8      = 0xd9, MP_Str16     = 0xda, MP_Str32     = 0xdb,
		MP_Array16   = 0xdc, MP_Array32   = 0xdd,
		MP_Map16     = 0xde, MP_Map32     = 0xdf,
		MP_DESYNCED_INVALID = 0xc4, MP_DESYNCED_DEADKEY = 0xc5, MP_DESYNCED_USERDATA = 0xc1 // custom format type bytes

	function Parse(is_table_key)
	{
		function GetIntPacked()
		{
			var res = 0, cnt = 0;
			do { var b = buf[p++]; res |= (b >> 1) << (7 * cnt++); } while (b & 1);
			return res;
		}
		function ParseTable(sz, is_map)
		{
			if (is_table_key) throw new Error("Unable to parse table key of type 'table'");
			if (sz > 5000000) throw new Error("Unable to parse table with too many items");

			var size_node = 0, size_array = 0;
			if (is_map)
			{
				size_node = (1 << (sz >> 1));
				if (sz & 1) size_array = GetIntPacked()
				if (size_node > 5000000 || size_array > 5000000) throw new Error("Unable to parse invalid table");
				GetIntPacked(); // used for Lua table memory layout
			}
			else
				size_array = sz;

			var t = (is_map ? {} : []);
			for (var i = 0, total = size_array + size_node; i != total;)
			{
				for (var vacancy_bits = buf[p++], mask = 1, iEnd = Math.min(total, i + 8); i != iEnd; i++, mask <<= 1)
				{
					if (vacancy_bits & mask) continue; // vacant
					var val = Parse();
					if (i < size_array)
					{
						t[i] = val; // use 0-based indexing (as opposed to Lua's 1-based indexing)
					}
					else
					{
						if (buf[p] == MP_DESYNCED_DEADKEY) { p++; GetIntPacked(); continue; } // used for Lua table memory layout
						t[Parse(true)] = val;
						GetIntPacked(); // used for Lua table memory layout
					}
				}
			}
			return t;
		}
		var type = buf[p++], q;
		switch (type)
		{
			case MP_Nil:   return undefined;
			case MP_False: return false;
			case MP_True:  return true;
			case MP_Float32: p += 4; return v.getFloat32(p - 4, true);
			case MP_Float64: p += 8; return v.getFloat64(p - 8, true);
			case MP_Uint8:   p += 1; return v.getUint8(p - 1, true);
			case MP_Uint16:  p += 2; return v.getUint16(p - 2, true);
			case MP_Uint32:  p += 4; return v.getUint32(p - 4, true);
			case MP_Uint64:  p += 8; return v.getBigUint64(p - 8, true);
			case MP_Int8:    p += 1; return v.getInt8(p - 1, true);
			case MP_Int16:   p += 2; return v.getInt16(p - 2, true);
			case MP_Int32:   p += 4; return v.getInt32(p - 4, true);
			case MP_Int64:   p += 8; return v.getBigInt64(p - 8, true);
			case MP_FixZero: return 0;
			case MP_Str8:    p += 1; q = p; p += v.getUint8(p - 1, true); return utf8.decode(buf.subarray(q, p));
			case MP_Str16:   p += 2; q = p; p += v.getUint16(p - 2, true); return utf8.decode(buf.subarray(q, p));
			case MP_Str32:   p += 4; q = p; p += v.getUint32(p - 4, true); return utf8.decode(buf.subarray(q, p));
			case MP_FixStr: return "";
			case MP_Array16:  p += 2; return ParseTable(v.getUint16(p - 2, true), false);
			case MP_Array32:  p += 4; return ParseTable(v.getUint32(p - 4, true), false);
			case MP_FixArray: return ParseTable(0, false);
			case MP_Map16:    p += 2; return ParseTable(v.getUint16(p - 2, true), true);
			case MP_Map32:    p += 4; return ParseTable(v.getUint32(p - 4, true), true);
			case MP_FixMap:   return ParseTable(0, true);
			case MP_DESYNCED_USERDATA:
				if (is_table_key) throw new Error("Unable to parse table key of type 'userdata'");
				throw new Error("Parsing userdata type " + GetIntPacked() + " is not supported");
			default:
				if      (type < MP_FixMap)   return type;
				else if (type < MP_FixArray) return ParseTable((type - MP_FixMap), true);
				else if (type < MP_FixStr)   return ParseTable((type - MP_FixArray), false);
				else if (type < MP_Nil)      { q = p; p += (type - MP_FixStr); return utf8.decode(buf.subarray(q, p)); }
				else if (type > MP_Map32)    return type - 256;
		}
		throw new Error('cannot parse unknown type ' + type);
	}
	return Parse();
}

export function ObjectToDesyncedString(obj, type)
{
	// Serialize object into growing buffer
	var mem = new WebAssembly.Memory({initial: 1, maximum: 4096 }); // 64kb pages
	var bytes = new Uint8Array(mem.buffer), view = new DataView(mem.buffer), pos = 0, end = 0, compressed_length = 0;
	const utf8 = new (typeof process === 'object' ? require("util").TextEncoder : TextEncoder)(); // default 'utf-8' or 'utf8'

	const
		MP_FixZero   = 0x00, MP_FixMap    = 0x80, MP_FixArray  = 0x90, MP_FixStr    = 0xa0,
		MP_Nil       = 0xc0, MP_False     = 0xc2, MP_True      = 0xc3,
		MP_Float32   = 0xca, MP_Float64   = 0xcb,
		MP_Uint8     = 0xcc, MP_Uint16    = 0xcd, MP_Uint32    = 0xce, MP_Uint64    = 0xcf,
		MP_Int8      = 0xd0, MP_Int16     = 0xd1, MP_Int32     = 0xd2, MP_Int64     = 0xd3,
		MP_Str8      = 0xd9, MP_Str16     = 0xda, MP_Str32     = 0xdb,
		MP_Array16   = 0xdc, MP_Array32   = 0xdd,
		MP_Map16     = 0xde, MP_Map32     = 0xdf;

	function Serialize(v, is_table_key)
	{
		function Grow(n)
		{
			const up = (end = (pos = end) + n) - bytes.length;
			if (up > 0) { mem.grow((up+0xFFFF)>>16); bytes = new Uint8Array(mem.buffer); view = new DataView(mem.buffer); }
			return view;
		}
		function Push(v) { Grow(1).setUint8(pos, v); }
		function PushIntPacked(v) { do { var b = v & 127; v >>= 7; Push((b << 1) | (v ? 1 : 0)); } while (v); }
		switch (v == null ? 'undefined' : typeof(v))
		{
			case 'undefined':
				if (is_table_key) throw new Error("Unable to serialize table key of type 'null/undefined'");
				Push(MP_Nil); 
				break;
			case 'boolean':
				if (is_table_key) throw new Error("Unable to serialize table key of type 'boolean'");
				Push(v ? MP_True : MP_False);
				break;
			case 'number':
				if (!Number.isInteger(v))  { Push(MP_Float64); Grow(8).setFloat64(pos, v, true); }
				else if (v >  0xffffffff)  { Push(MP_Uint64); Grow(8).setUint64(pos, v, true); }
				else if (v >  0xffff)      { Push(MP_Uint32); Grow(4).setUint32(pos, v, true); }
				else if (v >  0xff)        { Push(MP_Uint16); Grow(2).setUint16(pos, v, true); }
				else if (v >  0x7F)        { Push(MP_Uint8);  Grow(1).setUint8(pos, v); }
				else if (v >= 0)           { Push(v); }
				else if (v >= -32)         { Push(v + 256); }
				else if (v >= -128)        { Push(MP_Int8); Grow(1).setInt8(pos, v); }
				else if (v >= -32768)      { Push(MP_Int16); Grow(2).setInt16(pos, v, true); }
				else if (v >= -2147483648) { Push(MP_Int32); Grow(4).setInt32(pos, v, true); }
				else                       { Push(MP_Uint64); Grow(8).setUint64(pos, v, true); }
				break;
			case 'string':
				const strsz = v.length;
				if      (strsz <    32) { Push(MP_FixStr | strsz); }
				else if (strsz <   256) { Push(MP_Str8); Grow(1).setUint8(pos, strsz); }
				else if (strsz < 65536) { Push(MP_Str16); Grow(2).setUint16(pos, strsz, true); }
				else                    { Push(MP_Str32); Grow(4).setUint32(pos, strsz, true); }
				const encoded = utf8.encode(v);
				Grow(encoded.length);
				bytes.set(encoded, pos);
				break;
			case 'object':
				if (is_table_key) throw new Error("Unable to serialize table key of type 'table'");
				var size_node = 0, size_array = 0;
				while (v.hasOwnProperty(size_array)) size_array++;
				var keys = Object.keys(v), key_count = keys.length, is_map = (key_count > size_array);
				var sz = (is_map ? (((key_count - size_array - 1).toString(2).length << 1) | (size_array ? 1 : 0)) : size_array);
				if      (sz <    16) { Push((is_map ? MP_FixMap : MP_FixArray) | sz); }
				else if (sz < 65536) { Push((is_map ? MP_Map16 : MP_Array16)); Grow(2).setUint16(pos, sz, true); }
				else                 { Push((is_map ? MP_Map32 : MP_Array32)); Grow(4).setUint32(pos, sz, true); }

				if (is_map)
				{
					size_node = (1 << (sz >> 1)); // always the next power of 2
					if (size_array)
					{
						PushIntPacked(size_array); // store length of array part
						keys = keys.filter((k)=> !(k >= 0 && k < size_array)); // filter array-number keys
					}
					Push(0); // used for Lua table memory layout, ignored by the game for incoming encoded strings
				}

				for (var i = 0, total = size_array + size_node, vacancy_bits = 0; i != total;)
				{
					var bit = (i & 7);
					if (i >= key_count) vacancy_bits |= 1 << bit;
					if (++i != total && bit != 7) continue;

					// Write out bit+1 elements
					Push(vacancy_bits); // vacancy bits (only non-zero at the end)
					for (var j = i - 1 - bit; j != i; j++)
					{
						if (j >= key_count) continue; // vacant

						// Write out array/object value
						Serialize(j < size_array ? v[j] : v[keys[j - size_array]]);
						if (j < size_array) continue;

						// Write out object key
						Serialize(keys[j - size_array], true);
						Push(0); // used for Lua table memory layout, ignored by the game for incoming encoded strings
					}
				}
				break;

			default: throw new Error('cannot parse unsupported type ' + typeof(v));
		}
	}

	Serialize(obj);

	// Compress the output, but only use the compressed format if it actually saves space
	if (1)
	{
		/** @license zlib.js 2012 - imaya [ https://github.com/imaya/zlib.js ] The MIT License */
		var Zlib = {}, comp; (function() {'use strict';var n=void 0,w=!0,aa=this;function ba(f,d){var c=f.split("."),e=aa;!(c[0]in e)&&e.execScript&&e.execScript("var "+c[0]);for(var b;c.length&&(b=c.shift());)!c.length&&d!==n?e[b]=d:e=e[b]?e[b]:e[b]={}};var C="undefined"!==typeof Uint8Array&&"undefined"!==typeof Uint16Array&&"undefined"!==typeof Uint32Array&&"undefined"!==typeof DataView;function K(f,d){this.index="number"===typeof d?d:0;this.e=0;this.buffer=f instanceof(C?Uint8Array:Array)?f:new (C?Uint8Array:Array)(32768);if(2*this.buffer.length<=this.index)throw Error("invalid index");this.buffer.length<=this.index&&ca(this)}function ca(f){var d=f.buffer,c,e=d.length,b=new (C?Uint8Array:Array)(e<<1);if(C)b.set(d);else for(c=0;c<e;++c)b[c]=d[c];return f.buffer=b}K.prototype.b=function(f,d,c){var e=this.buffer,b=this.index,a=this.e,g=e[b],m;c&&1<d&&(f=8<d?(L[f&255]<<24|L[f>>>8&255]<<16|L[f>>>16&255]<<8|L[f>>>24&255])>>32-d:L[f]>>8-d);if(8>d+a)g=g<<d|f,a+=d;else for(m=0;m<d;++m)g=g<<1|f>>d-m-1&1,8===++a&&(a=0,e[b++]=L[g],g=0,b===e.length&&(e=ca(this)));e[b]=g;this.buffer=e;this.e=a;this.index=b};K.prototype.finish=function(){var f=this.buffer,d=this.index,c;0<this.e&&(f[d]<<=8-this.e,f[d]=L[f[d]],d++);C?c=f.subarray(0,d):(f.length=d,c=f);return c};var da=new (C?Uint8Array:Array)(256),M;for(M=0;256>M;++M){for(var N=M,S=N,ea=7,N=N>>>1;N;N>>>=1)S<<=1,S|=N&1,--ea;da[M]=(S<<ea&255)>>>0}var L=da;function ia(f){this.buffer=new (C?Uint16Array:Array)(2*f);this.length=0}ia.prototype.getParent=function(f){return 2*((f-2)/4|0)};ia.prototype.push=function(f,d){var c,e,b=this.buffer,a;c=this.length;b[this.length++]=d;for(b[this.length++]=f;0<c;)if(e=this.getParent(c),b[c]>b[e])a=b[c],b[c]=b[e],b[e]=a,a=b[c+1],b[c+1]=b[e+1],b[e+1]=a,c=e;else break;return this.length};ia.prototype.pop=function(){var f,d,c=this.buffer,e,b,a;d=c[0];f=c[1];this.length-=2;c[0]=c[this.length];c[1]=c[this.length+1];for(a=0;;){b=2*a+2;if(b>=this.length)break;b+2<this.length&&c[b+2]>c[b]&&(b+=2);if(c[b]>c[a])e=c[a],c[a]=c[b],c[b]=e,e=c[a+1],c[a+1]=c[b+1],c[b+1]=e;else break;a=b}return{index:f,value:d,length:this.length}};function ka(f,d){this.d=la;this.i=0;this.input=C&&f instanceof Array?new Uint8Array(f):f;this.c=0;d&&(d.lazy&&(this.i=d.lazy),"number"===typeof d.compressionType&&(this.d=d.compressionType),d.outputBuffer&&(this.a=C&&d.outputBuffer instanceof Array?new Uint8Array(d.outputBuffer):d.outputBuffer),"number"===typeof d.outputIndex&&(this.c=d.outputIndex));this.a||(this.a=new (C?Uint8Array:Array)(32768))}var la=2,na={NONE:0,h:1,g:la,n:3},T=[],U;for(U=0;288>U;U++)switch(w){case 143>=U:T.push([U+48,8]);break;case 255>=U:T.push([U-144+400,9]);break;case 279>=U:T.push([U-256+0,7]);break;case 287>=U:T.push([U-280+192,8]);break;default:throw"invalid literal: "+U;}ka.prototype.f=function(){var f,d,c,e,b=this.input;switch(this.d){case 0:c=0;for(e=b.length;c<e;){d=C?b.subarray(c,c+65535):b.slice(c,c+65535);c+=d.length;var a=d,g=c===e,m=n,k=n,p=n,t=n,u=n,l=this.a,h=this.c;if(C){for(l=new Uint8Array(this.a.buffer);l.length<=h+a.length+5;)l=new Uint8Array(l.length<<1);l.set(this.a)}m=g?1:0;l[h++]=m|0;k=a.length;p=~k+65536&65535;l[h++]=k&255;l[h++]=k>>>8&255;l[h++]=p&255;l[h++]=p>>>8&255;if(C)l.set(a,h),h+=a.length,l=l.subarray(0,h);else{t=0;for(u=a.length;t<u;++t)l[h++]=a[t];l.length=h}this.c=h;this.a=l}break;case 1:var q=new K(C?new Uint8Array(this.a.buffer):this.a,this.c);q.b(1,1,w);q.b(1,2,w);var s=oa(this,b),x,fa,z;x=0;for(fa=s.length;x<fa;x++)if(z=s[x],K.prototype.b.apply(q,T[z]),256<z)q.b(s[++x],s[++x],w),q.b(s[++x],5),q.b(s[++x],s[++x],w);else if(256===z)break;this.a=q.finish();this.c=this.a.length;break;case la:var B=new K(C?new Uint8Array(this.a.buffer):this.a,this.c),ta,J,O,P,Q,La=[16,17,18,0,8,7,9,6,10,5,11,4,12,3,13,2,14,1,15],X,ua,Y,va,ga,ja=Array(19),wa,R,ha,y,xa;ta=la;B.b(1,1,w);B.b(ta,2,w);J=oa(this,b);X=pa(this.m,15);ua=qa(X);Y=pa(this.l,7);va=qa(Y);for(O=286;257<O&&0===X[O-1];O--);for(P=30;1<P&&0===Y[P-1];P--);var ya=O,za=P,F=new (C?Uint32Array:Array)(ya+za),r,G,v,Z,E=new (C?Uint32Array:Array)(316),D,A,H=new (C?Uint8Array:Array)(19);for(r=G=0;r<ya;r++)F[G++]=X[r];for(r=0;r<za;r++)F[G++]=Y[r];if(!C){r=0;for(Z=H.length;r<Z;++r)H[r]=0}r=D=0;for(Z=F.length;r<Z;r+=G){for(G=1;r+G<Z&&F[r+G]===F[r];++G);v=G;if(0===F[r])if(3>v)for(;0<v--;)E[D++]=0,H[0]++;else for(;0<v;)A=138>v?v:138,A>v-3&&A<v&&(A=v-3),10>=A?(E[D++]=17,E[D++]=A-3,H[17]++):(E[D++]=18,E[D++]=A-11,H[18]++),v-=A;else if(E[D++]=F[r],H[F[r]]++,v--,3>v)for(;0<v--;)E[D++]=F[r],H[F[r]]++;else for(;0<v;)A=6>v?v:6,A>v-3&&A<v&&(A=v-3),E[D++]=16,E[D++]=A-3,H[16]++,v-=A}f=C?E.subarray(0,D):E.slice(0,D);ga=pa(H,7);for(y=0;19>y;y++)ja[y]=ga[La[y]];for(Q=19;4<Q&&0===ja[Q-1];Q--);wa=qa(ga);B.b(O-257,5,w);B.b(P-1,5,w);B.b(Q-4,4,w);for(y=0;y<Q;y++)B.b(ja[y],3,w);y=0;for(xa=f.length;y<xa;y++)if(R=f[y],B.b(wa[R],ga[R],w),16<=R){y++;switch(R){case 16:ha=2;break;case 17:ha=3;break;case 18:ha=7;break;default:throw"invalid code: "+R;}B.b(f[y],ha,w)}var Aa=[ua,X],Ba=[va,Y],I,Ca,$,ma,Da,Ea,Fa,Ga;Da=Aa[0];Ea=Aa[1];Fa=Ba[0];Ga=Ba[1];I=0;for(Ca=J.length;I<Ca;++I)if($=J[I],B.b(Da[$],Ea[$],w),256<$)B.b(J[++I],J[++I],w),ma=J[++I],B.b(Fa[ma],Ga[ma],w),B.b(J[++I],J[++I],w);else if(256===$)break;this.a=B.finish();this.c=this.a.length;break;default:throw"invalid compression type";}return this.a};function ra(f,d){this.length=f;this.k=d}var sa=function(){function f(b){switch(w){case 3===b:return[257,b-3,0];case 4===b:return[258,b-4,0];case 5===b:return[259,b-5,0];case 6===b:return[260,b-6,0];case 7===b:return[261,b-7,0];case 8===b:return[262,b-8,0];case 9===b:return[263,b-9,0];case 10===b:return[264,b-10,0];case 12>=b:return[265,b-11,1];case 14>=b:return[266,b-13,1];case 16>=b:return[267,b-15,1];case 18>=b:return[268,b-17,1];case 22>=b:return[269,b-19,2];case 26>=b:return[270,b-23,2];case 30>=b:return[271,b-27,2];case 34>=b:return[272,b-31,2];case 42>=b:return[273,b-35,3];case 50>=b:return[274,b-43,3];case 58>=b:return[275,b-51,3];case 66>=b:return[276,b-59,3];case 82>=b:return[277,b-67,4];case 98>=b:return[278,b-83,4];case 114>=b:return[279,b-99,4];case 130>=b:return[280,b-115,4];case 162>=b:return[281,b-131,5];case 194>=b:return[282,b-163,5];case 226>=b:return[283,b-195,5];case 257>=b:return[284,b-227,5];case 258===b:return[285,b-258,0];default:throw"invalid length: "+b;}}var d=[],c,e;for(c=3;258>=c;c++)e=f(c),d[c]=e[2]<<24|e[1]<<16|e[0];return d}(),Ha=C?new Uint32Array(sa):sa;function oa(f,d){function c(b,c){var a=b.k,d=[],e=0,f;f=Ha[b.length];d[e++]=f&65535;d[e++]=f>>16&255;d[e++]=f>>24;var g;switch(w){case 1===a:g=[0,a-1,0];break;case 2===a:g=[1,a-2,0];break;case 3===a:g=[2,a-3,0];break;case 4===a:g=[3,a-4,0];break;case 6>=a:g=[4,a-5,1];break;case 8>=a:g=[5,a-7,1];break;case 12>=a:g=[6,a-9,2];break;case 16>=a:g=[7,a-13,2];break;case 24>=a:g=[8,a-17,3];break;case 32>=a:g=[9,a-25,3];break;case 48>=a:g=[10,a-33,4];break;case 64>=a:g=[11,a-49,4];break;case 96>=a:g=[12,a-65,5];break;case 128>=a:g=[13,a-97,5];break;case 192>=a:g=[14,a-129,6];break;case 256>=a:g=[15,a-193,6];break;case 384>=a:g=[16,a-257,7];break;case 512>=a:g=[17,a-385,7];break;case 768>=a:g=[18,a-513,8];break;case 1024>=a:g=[19,a-769,8];break;case 1536>=a:g=[20,a-1025,9];break;case 2048>=a:g=[21,a-1537,9];break;case 3072>=a:g=[22,a-2049,10];break;case 4096>=a:g=[23,a-3073,10];break;case 6144>=a:g=[24,a-4097,11];break;case 8192>=a:g=[25,a-6145,11];break;case 12288>=a:g=[26,a-8193,12];break;case 16384>=a:g=[27,a-12289,12];break;case 24576>=a:g=[28,a-16385,13];break;case 32768>=a:g=[29,a-24577,13];break;default:throw"invalid distance";}f=g;d[e++]=f[0];d[e++]=f[1];d[e++]=f[2];var k,m;k=0;for(m=d.length;k<m;++k)l[h++]=d[k];s[d[0]]++;x[d[3]]++;q=b.length+c-1;u=null}var e,b,a,g,m,k={},p,t,u,l=C?new Uint16Array(2*d.length):[],h=0,q=0,s=new (C?Uint32Array:Array)(286),x=new (C?Uint32Array:Array)(30),fa=f.i,z;if(!C){for(a=0;285>=a;)s[a++]=0;for(a=0;29>=a;)x[a++]=0}s[256]=1;e=0;for(b=d.length;e<b;++e){a=m=0;for(g=3;a<g&&e+a!==b;++a)m=m<<8|d[e+a];k[m]===n&&(k[m]=[]);p=k[m];if(!(0<q--)){for(;0<p.length&&32768<e-p[0];)p.shift();if(e+3>=b){u&&c(u,-1);a=0;for(g=b-e;a<g;++a)z=d[e+a],l[h++]=z,++s[z];break}0<p.length?(t=Ia(d,e,p),u?u.length<t.length?(z=d[e-1],l[h++]=z,++s[z],c(t,0)):c(u,-1):t.length<fa?u=t:c(t,0)):u?c(u,-1):(z=d[e],l[h++]=z,++s[z])}p.push(e)}l[h++]=256;s[256]++;f.m=s;f.l=x;return C?l.subarray(0,h):l}function Ia(f,d,c){var e,b,a=0,g,m,k,p,t=f.length;m=0;p=c.length;a:for(;m<p;m++){e=c[p-m-1];g=3;if(3<a){for(k=a;3<k;k--)if(f[e+k-1]!==f[d+k-1])continue a;g=a}for(;258>g&&d+g<t&&f[e+g]===f[d+g];)++g;g>a&&(b=e,a=g);if(258===g)break}return new ra(a,d-b)}function pa(f,d){var c=f.length,e=new ia(572),b=new (C?Uint8Array:Array)(c),a,g,m,k,p;if(!C)for(k=0;k<c;k++)b[k]=0;for(k=0;k<c;++k)0<f[k]&&e.push(k,f[k]);a=Array(e.length/2);g=new (C?Uint32Array:Array)(e.length/2);if(1===a.length)return b[e.pop().index]=1,b;k=0;for(p=e.length/2;k<p;++k)a[k]=e.pop(),g[k]=a[k].value;m=Ja(g,g.length,d);k=0;for(p=a.length;k<p;++k)b[a[k].index]=m[k];return b}function Ja(f,d,c){function e(a){var b=k[a][p[a]];b===d?(e(a+1),e(a+1)):--g[b];++p[a]}var b=new (C?Uint16Array:Array)(c),a=new (C?Uint8Array:Array)(c),g=new (C?Uint8Array:Array)(d),m=Array(c),k=Array(c),p=Array(c),t=(1<<c)-d,u=1<<c-1,l,h,q,s,x;b[c-1]=d;for(h=0;h<c;++h)t<u?a[h]=0:(a[h]=1,t-=u),t<<=1,b[c-2-h]=(b[c-1-h]/2|0)+d;b[0]=a[0];m[0]=Array(b[0]);k[0]=Array(b[0]);for(h=1;h<c;++h)b[h]>2*b[h-1]+a[h]&&(b[h]=2*b[h-1]+a[h]),m[h]=Array(b[h]),k[h]=Array(b[h]);for(l=0;l<d;++l)g[l]=c;for(q=0;q<b[c-1];++q)m[c-1][q]=f[q],k[c-1][q]=q;for(l=0;l<c;++l)p[l]=0;1===a[c-1]&&(--g[0],++p[c-1]);for(h=c-2;0<=h;--h){s=l=0;x=p[h+1];for(q=0;q<b[h];q++)s=m[h+1][x]+m[h+1][x+1],s>f[l]?(m[h][q]=s,k[h][q]=d,x+=2):(m[h][q]=f[l],k[h][q]=l,++l);p[h]=0;1===a[h]&&e(h)}return g}function qa(f){var d=new (C?Uint16Array:Array)(f.length),c=[],e=[],b=0,a,g,m,k;a=0;for(g=f.length;a<g;a++)c[f[a]]=(c[f[a]]|0)+1;a=1;for(g=16;a<=g;a++)e[a]=b,b+=c[a]|0,b<<=1;a=0;for(g=f.length;a<g;a++){b=e[f[a]];e[f[a]]+=1;m=d[a]=0;for(k=f[a];m<k;m++)d[a]=d[a]<<1|b&1,b>>>=1}return d};function Ka(f,d){this.input=f;this.a=new (C?Uint8Array:Array)(32768);this.d=V.g;var c={},e;if((d||!(d={}))&&"number"===typeof d.compressionType)this.d=d.compressionType;for(e in d)c[e]=d[e];c.outputBuffer=this.a;this.j=new ka(this.input,c)}var V=na;Ka.prototype.f=function(){var f,d,c,e,b,a,g=0;a=this.a;switch(8){case 8:f=Math.LOG2E*Math.log(32768)-8;break;default:throw Error("invalid compression method");}d=f<<4|8;a[g++]=d;switch(8){case 8:switch(this.d){case V.NONE:e=0;break;case V.h:e=1;break;case V.g:e=2;break;default:throw Error("unsupported compression type");}break;default:throw Error("invalid compression method");}c=e<<6|0;a[g++]=c|31-(256*d+c)%31;var m=this.input;if("string"===typeof m){var k=m.split(""),p,t;p=0;for(t=k.length;p<t;p++)k[p]=(k[p].charCodeAt(0)&255)>>>0;m=k}for(var u=1,l=0,h=m.length,q,s=0;0<h;){q=1024<h?1024:h;h-=q;do u+=m[s++],l+=u;while(--q);u%=65521;l%=65521}b=(l<<16|u)>>>0;this.j.c=g;a=this.j.f();g=a.length;C&&(a=new Uint8Array(a.buffer),a.length<=g+4&&(this.a=new Uint8Array(a.length+4),this.a.set(a),a=this.a),a=a.subarray(0,g+4));a[g++]=b>>24&255;a[g++]=b>>16&255;a[g++]=b>>8&255;a[g++]=b&255;return a};ba("Zlib.Deflate",Ka);ba("Zlib.Deflate.compress",function(f,d){return(new Ka(f,d)).f()});ba("Zlib.Deflate.prototype.compress",Ka.prototype.f);var Ma={NONE:V.NONE,FIXED:V.h,DYNAMIC:V.g},Na,Oa,W,Pa;if(Object.keys)Na=Object.keys(Ma);else for(Oa in Na=[],W=0,Ma)Na[W++]=Oa;W=0;for(Pa=Na.length;W<Pa;++W)Oa=Na[W],ba("Zlib.Deflate.CompressionType."+Oa,Ma[Oa]);}).call(Zlib);
		try { comp = (new Zlib.Zlib.Deflate(bytes.subarray(0, end))).compress(); } catch { throw new Error("Error during compression of output data"); }
		if (comp && comp.length < end) { compressed_length = end; bytes = comp; end = comp.length; }
	}

	// Custom Base62 format for encoding Lua tables into strings (there is no Base62 standard so the way bytes and lengths are encoded is original)
	const Base62_ByteToChar = ['0','1','2','3','4','5','6','7','8','9','A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z','a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z'];
	const Base62_CharsForBytes = [ 0, 2, 3, 5 ];
	function Base62_GetEncodedU32Size(u) { for (var n = 1; ; n++) if (!(u = (u/31)|0)) return n; }
	function Base62_GetEncodedDataSize(datalen) { return (((datalen * 6 + 2) / 4)|0) + 1; } // with 1 byte checksum
	function Base62_WriteU32(arr, u)
	{
		var tok = Base62_ByteToChar[31 + (u % 31)];
		while (u = (u / 31)|0) tok = Base62_ByteToChar[u % 31] + tok;
		arr.push(tok);
	}
	function Base62_WriteData(arr, data, datalen)
	{
		for (var chksum = 0, i = 0; datalen > 0; datalen -= 4, i += 4)
		{
			var nchars = (datalen > 3 ? 6 : Base62_CharsForBytes[datalen]), tok = '';
			var bits = (data[i+0] | (data[i+1] << 8) | (data[i+2] << 16)) + ((data[i+3]|0) * 0x1000000); // keep unsigned
			chksum = ((chksum + bits) % 4294967296);
			for (var j = 0; j != nchars; j++, bits = (bits / 62)|0)
				tok = Base62_ByteToChar[bits % 62] + tok;
			arr.push(tok);
		}
		arr.push(Base62_ByteToChar[chksum % 62]);
	}

	// Fill token array and return joined result string
	var arr = ["DS" + (type ? type.substr(0,1) : '?')];
	Base62_WriteU32(arr, compressed_length);
	Base62_WriteData(arr, bytes, end);
	return arr.join('');
}
