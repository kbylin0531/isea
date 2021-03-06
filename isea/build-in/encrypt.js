// var sha1 = (function () {
//     /**
//      * The standard SHA1 needs the input string to fit into a block
//      * This function align the input string to meet the requirement
//      */
//     var AlignSHA1 = function (str) {
//         var nblk = ((str.length + 8) >> 6) + 1, blks = new Array(nblk * 16);
//         for (var i = 0; i < nblk * 16; i++) blks[i] = 0;
//         for (i = 0; i < str.length; i++) blks[i >> 2] |= str.charCodeAt(i) << (24 - (i & 3) * 8);
//         blks[i >> 2] |= 0x80 << (24 - (i & 3) * 8);
//         blks[nblk * 16 - 1] = str.length * 8;
//         return blks;
//     };
//     /**
//      * Bitwise rotate a 32-bit number to the left.
//      * 32位二进制数循环左移
//      */
//     var rol = function (num, cnt) {
//         return (num << cnt) | (num >>> (32 - cnt));
//     };
//
//     /**
//      * Calculate the SHA-1 of an array of big-endian words, and a bit length
//      */
//     var core_sha1 = function (blockArray) {
//         var x = blockArray; // append padding
//         var w = new Array(80);
//         var a = 1732584193;
//         var b = -271733879;
//         var c = -1732584194;
//         var d = 271733878;
//         var e = -1009589776;
//         for (var i = 0; i < x.length; i += 16) {// 每次处理512位 16*32
//             var olda = a;
//             var oldb = b;
//             var oldc = c;
//             var oldd = d;
//             var olde = e;
//             for (var j = 0; j < 80; j++) {// 对每个512位进行80步操作
//                 if (j < 16) w[j] = x[i + j];
//                 else w[j] = rol(w[j - 3] ^ w[j - 8] ^ w[j - 14] ^ w[j - 16], 1);
//                 var t = safe_add(safe_add(rol(a, 5), sha1_ft(j, b, c, d)), safe_add(safe_add(e, w[j]), sha1_kt(j)));
//                 e = d;
//                 d = c;
//                 c = rol(b, 30);
//                 b = a;
//                 a = t;
//             }
//             a = safe_add(a, olda);
//             b = safe_add(b, oldb);
//             c = safe_add(c, oldc);
//             d = safe_add(d, oldd);
//             e = safe_add(e, olde);
//         }
//         return [a, b, c, d, e];
//     };
//
//     /**
//      * Convert an array of big-endian words to a hex string.
//      */
//     var binb2hex = function (binarray) {
//         var hex_tab = "0123456789ABCDEF";
//         var str = "";
//         for (var i = 0; i < binarray.length * 4; i++) str += hex_tab.charAt((binarray[i >> 2] >> ((3 - i % 4) * 8 + 4)) & 0xF) + hex_tab.charAt((binarray[i >> 2] >> ((3 - i % 4) * 8)) & 0xF);
//         return str;
//     };
//
//     /**
//      * Perform the appropriate triplet combination function for the current
//      * iteration
//      * 返回对应F函数的值
//      */
//     var sha1_ft = function (t, b, c, d) {
//         if (t < 20) return (b & c) | ((~b) & d);
//         if (t < 40)  return b ^ c ^ d;
//         if (t < 60) return (b & c) | (b & d) | (c & d);
//         return b ^ c ^ d; // t<80
//     };
//     /**
//      * Determine the appropriate additive constant for the current iteration
//      * 返回对应的Kt值
//      */
//     var sha1_kt = function (t) {
//         return (t < 20) ? 1518500249 : (t < 40) ? 1859775393 : (t < 60) ? -1894007588 : -899497514;
//     };
//     /**
//      * Add integers, wrapping at 2^32. This uses 16-bit operations internally
//      * to work around bugs in some JS interpreters.
//      * 将32位数拆成高16位和低16位分别进行相加，从而实现 MOD 2^32 的加法
//      */
//     var safe_add = function (x, y) {
//         var lsw = (x & 0xFFFF) + (y & 0xFFFF);
//         var msw = (x >> 16) + (y >> 16) + (lsw >> 16);
//         return (msw << 16) | (lsw & 0xFFFF);
//     };
//
//     return (function (s) {
//         return binb2hex(core_sha1(AlignSHA1(s)));
//     });
// })();

/**
 * website : http://tool.oschina.net/encrypt?type=2
 */


'use strict';
/*
 * js-sha1 v0.3.0
 * https://github.com/emn178/js-sha1
 *
 * Copyright 2014-2015, emn178@gmail.com
 *
 * Licensed under the MIT license:
 * http://www.opensource.org/licenses/MIT
 */
(function(root, undefined){

    var HEX_CHARS = '0123456789abcdef'.split('');
    var EXTRA = [-2147483648, 8388608, 32768, 128];
    var SHIFT = [24, 16, 8, 0];

    var blocks = [];

    root.sha1 = function(message) {
        var notString = typeof(message) != 'string';
        if(notString && message.constructor == ArrayBuffer) {
            message = new Uint8Array(message);
        }

        var h0, h1, h2, h3, h4, block = 0, code, end = false, t, f,
            i, j, index = 0, start = 0, bytes = 0, length = message.length;

        h0 = 0x67452301;
        h1 = 0xEFCDAB89;
        h2 = 0x98BADCFE;
        h3 = 0x10325476;
        h4 = 0xC3D2E1F0;

        do {
            blocks[0] = block;
            blocks[16] = blocks[1] = blocks[2] = blocks[3] =
                blocks[4] = blocks[5] = blocks[6] = blocks[7] =
                    blocks[8] = blocks[9] = blocks[10] = blocks[11] =
                        blocks[12] = blocks[13] = blocks[14] = blocks[15] = 0;
            if(notString) {
                for (i = start;index < length && i < 64; ++index) {
                    blocks[i >> 2] |= message[index] << SHIFT[i++ & 3];
                }
            } else {
                for (i = start;index < length && i < 64; ++index) {
                    code = message.charCodeAt(index);
                    if (code < 0x80) {
                        blocks[i >> 2] |= code << SHIFT[i++ & 3];
                    } else if (code < 0x800) {
                        blocks[i >> 2] |= (0xc0 | (code >> 6)) << SHIFT[i++ & 3];
                        blocks[i >> 2] |= (0x80 | (code & 0x3f)) << SHIFT[i++ & 3];
                    } else if (code < 0xd800 || code >= 0xe000) {
                        blocks[i >> 2] |= (0xe0 | (code >> 12)) << SHIFT[i++ & 3];
                        blocks[i >> 2] |= (0x80 | ((code >> 6) & 0x3f)) << SHIFT[i++ & 3];
                        blocks[i >> 2] |= (0x80 | (code & 0x3f)) << SHIFT[i++ & 3];
                    } else {
                        code = 0x10000 + (((code & 0x3ff) << 10) | (message.charCodeAt(++index) & 0x3ff));
                        blocks[i >> 2] |= (0xf0 | (code >> 18)) << SHIFT[i++ & 3];
                        blocks[i >> 2] |= (0x80 | ((code >> 12) & 0x3f)) << SHIFT[i++ & 3];
                        blocks[i >> 2] |= (0x80 | ((code >> 6) & 0x3f)) << SHIFT[i++ & 3];
                        blocks[i >> 2] |= (0x80 | (code & 0x3f)) << SHIFT[i++ & 3];
                    }
                }
            }
            bytes += i - start;
            start = i - 64;
            if(index == length) {
                blocks[i >> 2] |= EXTRA[i & 3];
                ++index;
            }
            block = blocks[16];
            if(index > length && i < 56) {
                blocks[15] = bytes << 3;
                end = true;
            }

            for(j = 16;j < 80;++j) {
                t = blocks[j - 3] ^ blocks[j - 8] ^ blocks[j - 14] ^ blocks[j - 16];
                blocks[j] =  (t << 1) | (t >>> 31);
            }

            var a = h0, b = h1, c = h2, d = h3, e = h4;
            for(j = 0;j < 20;j += 5) {
                f = (b & c) | ((~b) & d);
                t = (a << 5) | (a >>> 27);
                e = t + f + e + 1518500249 + blocks[j] << 0;
                b = (b << 30) | (b >>> 2);

                f = (a & b) | ((~a) & c);
                t = (e << 5) | (e >>> 27);
                d = t + f + d + 1518500249 + blocks[j + 1] << 0;
                a = (a << 30) | (a >>> 2);

                f = (e & a) | ((~e) & b);
                t = (d << 5) | (d >>> 27);
                c = t + f + c + 1518500249 + blocks[j + 2] << 0;
                e = (e << 30) | (e >>> 2);

                f = (d & e) | ((~d) & a);
                t = (c << 5) | (c >>> 27);
                b = t + f + b + 1518500249 + blocks[j + 3] << 0;
                d = (d << 30) | (d >>> 2);

                f = (c & d) | ((~c) & e);
                t = (b << 5) | (b >>> 27);
                a = t + f + a + 1518500249 + blocks[j + 4] << 0;
                c = (c << 30) | (c >>> 2);
            }

            for(;j < 40;j += 5) {
                f = b ^ c ^ d;
                t = (a << 5) | (a >>> 27);
                e = t + f + e + 1859775393 + blocks[j] << 0;
                b = (b << 30) | (b >>> 2);

                f = a ^ b ^ c;
                t = (e << 5) | (e >>> 27);
                d = t + f + d + 1859775393 + blocks[j + 1] << 0;
                a = (a << 30) | (a >>> 2);

                f = e ^ a ^ b;
                t = (d << 5) | (d >>> 27);
                c = t + f + c + 1859775393 + blocks[j + 2] << 0;
                e = (e << 30) | (e >>> 2);

                f = d ^ e ^ a;
                t = (c << 5) | (c >>> 27);
                b = t + f + b + 1859775393 + blocks[j + 3] << 0;
                d = (d << 30) | (d >>> 2);

                f = c ^ d ^ e;
                t = (b << 5) | (b >>> 27);
                a = t + f + a + 1859775393 + blocks[j + 4] << 0;
                c = (c << 30) | (c >>> 2);
            }

            for(;j < 60;j += 5) {
                f = (b & c) | (b & d) | (c & d);
                t = (a << 5) | (a >>> 27);
                e = t + f + e - 1894007588 + blocks[j] << 0;
                b = (b << 30) | (b >>> 2);

                f = (a & b) | (a & c) | (b & c);
                t = (e << 5) | (e >>> 27);
                d = t + f + d - 1894007588 + blocks[j + 1] << 0;
                a = (a << 30) | (a >>> 2);

                f = (e & a) | (e & b) | (a & b);
                t = (d << 5) | (d >>> 27);
                c = t + f + c - 1894007588 + blocks[j + 2] << 0;
                e = (e << 30) | (e >>> 2);

                f = (d & e) | (d & a) | (e & a);
                t = (c << 5) | (c >>> 27);
                b = t + f + b - 1894007588 + blocks[j + 3] << 0;
                d = (d << 30) | (d >>> 2);

                f = (c & d) | (c & e) | (d & e);
                t = (b << 5) | (b >>> 27);
                a = t + f + a - 1894007588 + blocks[j + 4] << 0;
                c = (c << 30) | (c >>> 2);
            }

            for(;j < 80;j += 5) {
                f = b ^ c ^ d;
                t = (a << 5) | (a >>> 27);
                e = t + f + e - 899497514 + blocks[j] << 0;
                b = (b << 30) | (b >>> 2);

                f = a ^ b ^ c;
                t = (e << 5) | (e >>> 27);
                d = t + f + d - 899497514 + blocks[j + 1] << 0;
                a = (a << 30) | (a >>> 2);

                f = e ^ a ^ b;
                t = (d << 5) | (d >>> 27);
                c = t + f + c - 899497514 + blocks[j + 2] << 0;
                e = (e << 30) | (e >>> 2);

                f = d ^ e ^ a;
                t = (c << 5) | (c >>> 27);
                b = t + f + b - 899497514 + blocks[j + 3] << 0;
                d = (d << 30) | (d >>> 2);

                f = c ^ d ^ e;
                t = (b << 5) | (b >>> 27);
                a = t + f + a - 899497514 + blocks[j + 4] << 0;
                c = (c << 30) | (c >>> 2);
            }

            h0 = h0 + a << 0;
            h1 = h1 + b << 0;
            h2 = h2 + c << 0;
            h3 = h3 + d << 0;
            h4 = h4 + e << 0;
        } while(!end);

        return HEX_CHARS[(h0 >> 28) & 0x0F] + HEX_CHARS[(h0 >> 24) & 0x0F] +
            HEX_CHARS[(h0 >> 20) & 0x0F] + HEX_CHARS[(h0 >> 16) & 0x0F] +
            HEX_CHARS[(h0 >> 12) & 0x0F] + HEX_CHARS[(h0 >> 8) & 0x0F] +
            HEX_CHARS[(h0 >> 4) & 0x0F] + HEX_CHARS[h0 & 0x0F] +
            HEX_CHARS[(h1 >> 28) & 0x0F] + HEX_CHARS[(h1 >> 24) & 0x0F] +
            HEX_CHARS[(h1 >> 20) & 0x0F] + HEX_CHARS[(h1 >> 16) & 0x0F] +
            HEX_CHARS[(h1 >> 12) & 0x0F] + HEX_CHARS[(h1 >> 8) & 0x0F] +
            HEX_CHARS[(h1 >> 4) & 0x0F] + HEX_CHARS[h1 & 0x0F] +
            HEX_CHARS[(h2 >> 28) & 0x0F] + HEX_CHARS[(h2 >> 24) & 0x0F] +
            HEX_CHARS[(h2 >> 20) & 0x0F] + HEX_CHARS[(h2 >> 16) & 0x0F] +
            HEX_CHARS[(h2 >> 12) & 0x0F] + HEX_CHARS[(h2 >> 8) & 0x0F] +
            HEX_CHARS[(h2 >> 4) & 0x0F] + HEX_CHARS[h2 & 0x0F] +
            HEX_CHARS[(h3 >> 28) & 0x0F] + HEX_CHARS[(h3 >> 24) & 0x0F] +
            HEX_CHARS[(h3 >> 20) & 0x0F] + HEX_CHARS[(h3 >> 16) & 0x0F] +
            HEX_CHARS[(h3 >> 12) & 0x0F] + HEX_CHARS[(h3 >> 8) & 0x0F] +
            HEX_CHARS[(h3 >> 4) & 0x0F] + HEX_CHARS[h3 & 0x0F] +
            HEX_CHARS[(h4 >> 28) & 0x0F] + HEX_CHARS[(h4 >> 24) & 0x0F] +
            HEX_CHARS[(h4 >> 20) & 0x0F] + HEX_CHARS[(h4 >> 16) & 0x0F] +
            HEX_CHARS[(h4 >> 12) & 0x0F] + HEX_CHARS[(h4 >> 8) & 0x0F] +
            HEX_CHARS[(h4 >> 4) & 0x0F] + HEX_CHARS[h4 & 0x0F];
    };
}(window));

var md5 = (function () {

    var rotateLeft = function (lValue, iShiftBits) {
        var a = lValue << iShiftBits;
        var b = lValue >>> (32 - iShiftBits);
        return a | b;
    };
    var addUnsigned = function (lX, lY) {
        var lX4, lY4, lX8, lY8, lResult;
        lX8 = (lX & 0x80000000);
        lY8 = (lY & 0x80000000);
        lX4 = (lX & 0x40000000);
        lY4 = (lY & 0x40000000);
        lResult = (lX & 0x3FFFFFFF) + (lY & 0x3FFFFFFF);
        var c = lX4 & lY4;
        if (c) {
            return (lResult ^ 0x80000000 ^ lX8 ^ lY8);
        }
        var v = 0;
        c = lX4 | lY4;
        if (c) {
            c = lResult & 0x40000000;
            if (c) {
                v = (lResult ^ 0xC0000000 ^ lX8 ^ lY8);
            } else {
                v = (lResult ^ 0x40000000 ^ lX8 ^ lY8);
            }
        } else {
            v = (lResult ^ lX8 ^ lY8);
        }
        return v;
    };
    var f = function (x, y, z) {
        return (x & y) | ((~x) & z);
    };
    var g = function (x, y, z) {
        return (x & z) | (y & (~z));
    };
    var h = function (x, y, z) {
        return (x ^ y ^ z);
    };
    var i = function (x, y, z) {
        return (y ^ (x | (~z)));
    };
    var FF = function (a, b, c, d, x, s, ac) {
        a = addUnsigned(a, addUnsigned(addUnsigned(f(b, c, d), x), ac));
        return addUnsigned(rotateLeft(a, s), b);
    };
    var GG = function (a, b, c, d, x, s, ac) {
        a = addUnsigned(a, addUnsigned(addUnsigned(g(b, c, d), x), ac));
        return addUnsigned(rotateLeft(a, s), b);
    };
    var HH = function (a, b, c, d, x, s, ac) {
        a = addUnsigned(a, addUnsigned(addUnsigned(h(b, c, d), x), ac));
        return addUnsigned(rotateLeft(a, s), b);
    };
    var II = function (a, b, c, d, x, s, ac) {
        a = addUnsigned(a, addUnsigned(addUnsigned(i(b, c, d), x), ac));
        return addUnsigned(rotateLeft(a, s), b);
    };
    /**
     *
     * @param str string
     * @returns {Array}
     * @constructor
     */
    var convertToWordArray = function (str) {
        var lWordCount;
        var lMessageLength = str.length;
        var lNumberOfWords_temp1 = lMessageLength + 8;
        var lNumberOfWords_temp2 = (lNumberOfWords_temp1 - (lNumberOfWords_temp1 % 64)) / 64;
        var lNumberOfWords = (lNumberOfWords_temp2 + 1) * 16;
        var lWordArray = new Array(lNumberOfWords - 1);
        var lBytePosition = 0;
        var lByteCount = 0;
        while (lByteCount < lMessageLength) {
            lWordCount = (lByteCount - (lByteCount % 4)) / 4;
            lBytePosition = (lByteCount % 4) * 8;
            lWordArray[lWordCount] = (lWordArray[lWordCount] | (str.charCodeAt(lByteCount) << lBytePosition));
            lByteCount++;
        }
        lWordCount = (lByteCount - (lByteCount % 4)) / 4;
        lBytePosition = (lByteCount % 4) * 8;
        lWordArray[lWordCount] = lWordArray[lWordCount] | (0x80 << lBytePosition);
        lWordArray[lNumberOfWords - 2] = lMessageLength << 3;
        lWordArray[lNumberOfWords - 1] = lMessageLength >>> 29;
        return lWordArray;
    };
    var wordToHex = function (lValue) {
        var WordToHexValue = "", WordToHexValue_temp = "", lByte, lCount;
        for (lCount = 0; lCount <= 3; lCount++) {
            lByte = (lValue >>> (lCount * 8)) & 255;
            WordToHexValue_temp = "0" + lByte.toString(16);
            WordToHexValue = WordToHexValue + WordToHexValue_temp.substr(WordToHexValue_temp.length - 2, 2);
        }
        return WordToHexValue;
    };
    var utf8Encode = function (str) {
        str = str.replace(/\r\n/g, "\n");
        var utftext = "";
        for (var n = 0; n < str.length; n++) {
            var c = str.charCodeAt(n);
            if (c < 128) {
                utftext += String.fromCharCode(c);
            } else if ((c > 127) && (c < 2048)) {
                utftext += String.fromCharCode((c >> 6) | 192);
                utftext += String.fromCharCode((c & 63) | 128);
            } else {
                utftext += String.fromCharCode((c >> 12) | 224);
                utftext += String.fromCharCode(((c >> 6) & 63) | 128);
                utftext += String.fromCharCode((c & 63) | 128);
            }
        }
        return utftext;
    };

    return (function (str) {
        var k, AA, BB, CC, DD, a, b, c, d;
        var S11 = 7, S12 = 12, S13 = 17, S14 = 22;
        var S21 = 5, S22 = 9, S23 = 14, S24 = 20;
        var S31 = 4, S32 = 11, S33 = 16, S34 = 23;
        var S41 = 6, S42 = 10, S43 = 15, S44 = 21;
        str = utf8Encode(str);
        var x = convertToWordArray(str);
        a = 0x67452301;
        b = 0xEFCDAB89;
        c = 0x98BADCFE;
        d = 0x10325476;
        for (k = 0; k < x.length; k += 16) {
            AA = a;
            BB = b;
            CC = c;
            DD = d;
            a = FF(a, b, c, d, x[k], S11, 0xD76AA478);
            d = FF(d, a, b, c, x[k + 1], S12, 0xE8C7B756);
            c = FF(c, d, a, b, x[k + 2], S13, 0x242070DB);
            b = FF(b, c, d, a, x[k + 3], S14, 0xC1BDCEEE);
            a = FF(a, b, c, d, x[k + 4], S11, 0xF57C0FAF);
            d = FF(d, a, b, c, x[k + 5], S12, 0x4787C62A);
            c = FF(c, d, a, b, x[k + 6], S13, 0xA8304613);
            b = FF(b, c, d, a, x[k + 7], S14, 0xFD469501);
            a = FF(a, b, c, d, x[k + 8], S11, 0x698098D8);
            d = FF(d, a, b, c, x[k + 9], S12, 0x8B44F7AF);
            c = FF(c, d, a, b, x[k + 10], S13, 0xFFFF5BB1);
            b = FF(b, c, d, a, x[k + 11], S14, 0x895CD7BE);
            a = FF(a, b, c, d, x[k + 12], S11, 0x6B901122);
            d = FF(d, a, b, c, x[k + 13], S12, 0xFD987193);
            c = FF(c, d, a, b, x[k + 14], S13, 0xA679438E);
            b = FF(b, c, d, a, x[k + 15], S14, 0x49B40821);
            a = GG(a, b, c, d, x[k + 1], S21, 0xF61E2562);
            d = GG(d, a, b, c, x[k + 6], S22, 0xC040B340);
            c = GG(c, d, a, b, x[k + 11], S23, 0x265E5A51);
            b = GG(b, c, d, a, x[k], S24, 0xE9B6C7AA);
            a = GG(a, b, c, d, x[k + 5], S21, 0xD62F105D);
            d = GG(d, a, b, c, x[k + 10], S22, 0x2441453);
            c = GG(c, d, a, b, x[k + 15], S23, 0xD8A1E681);
            b = GG(b, c, d, a, x[k + 4], S24, 0xE7D3FBC8);
            a = GG(a, b, c, d, x[k + 9], S21, 0x21E1CDE6);
            d = GG(d, a, b, c, x[k + 14], S22, 0xC33707D6);
            c = GG(c, d, a, b, x[k + 3], S23, 0xF4D50D87);
            b = GG(b, c, d, a, x[k + 8], S24, 0x455A14ED);
            a = GG(a, b, c, d, x[k + 13], S21, 0xA9E3E905);
            d = GG(d, a, b, c, x[k + 2], S22, 0xFCEFA3F8);
            c = GG(c, d, a, b, x[k + 7], S23, 0x676F02D9);
            b = GG(b, c, d, a, x[k + 12], S24, 0x8D2A4C8A);
            a = HH(a, b, c, d, x[k + 5], S31, 0xFFFA3942);
            d = HH(d, a, b, c, x[k + 8], S32, 0x8771F681);
            c = HH(c, d, a, b, x[k + 11], S33, 0x6D9D6122);
            b = HH(b, c, d, a, x[k + 14], S34, 0xFDE5380C);
            a = HH(a, b, c, d, x[k + 1], S31, 0xA4BEEA44);
            d = HH(d, a, b, c, x[k + 4], S32, 0x4BDECFA9);
            c = HH(c, d, a, b, x[k + 7], S33, 0xF6BB4B60);
            b = HH(b, c, d, a, x[k + 10], S34, 0xBEBFBC70);
            a = HH(a, b, c, d, x[k + 13], S31, 0x289B7EC6);
            d = HH(d, a, b, c, x[k], S32, 0xEAA127FA);
            c = HH(c, d, a, b, x[k + 3], S33, 0xD4EF3085);
            b = HH(b, c, d, a, x[k + 6], S34, 0x4881D05);
            a = HH(a, b, c, d, x[k + 9], S31, 0xD9D4D039);
            d = HH(d, a, b, c, x[k + 12], S32, 0xE6DB99E5);
            c = HH(c, d, a, b, x[k + 15], S33, 0x1FA27CF8);
            b = HH(b, c, d, a, x[k + 2], S34, 0xC4AC5665);
            a = II(a, b, c, d, x[k], S41, 0xF4292244);
            d = II(d, a, b, c, x[k + 7], S42, 0x432AFF97);
            c = II(c, d, a, b, x[k + 14], S43, 0xAB9423A7);
            b = II(b, c, d, a, x[k + 5], S44, 0xFC93A039);
            a = II(a, b, c, d, x[k + 12], S41, 0x655B59C3);
            d = II(d, a, b, c, x[k + 3], S42, 0x8F0CCC92);
            c = II(c, d, a, b, x[k + 10], S43, 0xFFEFF47D);
            b = II(b, c, d, a, x[k + 1], S44, 0x85845DD1);
            a = II(a, b, c, d, x[k + 8], S41, 0x6FA87E4F);
            d = II(d, a, b, c, x[k + 15], S42, 0xFE2CE6E0);
            c = II(c, d, a, b, x[k + 6], S43, 0xA3014314);
            b = II(b, c, d, a, x[k + 13], S44, 0x4E0811A1);
            a = II(a, b, c, d, x[k + 4], S41, 0xF7537E82);
            d = II(d, a, b, c, x[k + 11], S42, 0xBD3AF235);
            c = II(c, d, a, b, x[k + 2], S43, 0x2AD7D2BB);
            b = II(b, c, d, a, x[k + 9], S44, 0xEB86D391);
            a = addUnsigned(a, AA);
            b = addUnsigned(b, BB);
            c = addUnsigned(c, CC);
            d = addUnsigned(d, DD);
        }
        var temp = wordToHex(a) + wordToHex(b) + wordToHex(c) + wordToHex(d);
        return temp.toLowerCase();
    });
})();


L.sha1 = sha1;
L.md5 = md5;
// console.log(md5('123456'));
// console.log(sha1('123456'));
// 加密测试
// console.log(L.md5(L.sha1('123456')),'d93a5def7511da3d0f2d171d9c344e91');