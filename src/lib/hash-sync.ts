/**
 * Standard SHA-256 synchronous implementation in pure TypeScript.
 * Works identically on both client (browser) and server (Node.js).
 */

export function sha256Sync(str: string): string {
  const ch = (x: number, y: number, z: number) => (x & y) ^ (~x & z);
  const maj = (x: number, y: number, z: number) => (x & y) ^ (x & z) ^ (y & z);
  const sigma0 = (x: number) =>
    ((x >>> 2) | (x << 30)) ^
    ((x >>> 13) | (x << 19)) ^
    ((x >>> 22) | (x << 10));
  const sigma1 = (x: number) =>
    ((x >>> 6) | (x << 26)) ^
    ((x >>> 11) | (x << 21)) ^
    ((x >>> 25) | (x << 7));
  const gamma0 = (x: number) =>
    ((x >>> 7) | (x << 25)) ^ ((x >>> 18) | (x << 14)) ^ (x >>> 3);
  const gamma1 = (x: number) =>
    ((x >>> 17) | (x << 15)) ^ ((x >>> 19) | (x << 13)) ^ (x >>> 10);

  const K = [
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1,
    0x923f82a4, 0xab1c5ed5, 0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3,
    0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174, 0xe49b69c1, 0xefbe4786,
    0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147,
    0x06ca6351, 0x14292967, 0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13,
    0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85, 0xa2bfe8a1, 0xa81a664b,
    0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a,
    0x5b9cca4f, 0x682e6ff3, 0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208,
    0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
  ];

  const words = [] as number[];
  const ascii = unescape(encodeURIComponent(str));
  for (let i = 0; i < ascii.length; i++) {
    words[i >> 2] |= (ascii.charCodeAt(i) & 0xff) << (24 - (i % 4) * 8);
  }

  const bits = ascii.length * 8;
  words[words.length] = 0x80 << (24 - (ascii.length % 4) * 8);
  while (words.length % 16 !== 14) {
    words.push(0);
  }
  words.push(Math.floor(bits / 0x100000000));
  words.push(bits | 0);

  let H0 = 0x6a09e667;
  let H1 = 0xbb67ae85;
  let H2 = 0x3c6ef372;
  let H3 = 0xa54ff53a;
  let H4 = 0x510e527f;
  let H5 = 0x9b05688c;
  let H6 = 0x1f83d9ab;
  let H7 = 0x5be0cd19;

  for (let i = 0; i < words.length; i += 16) {
    const w = [] as number[];
    for (let t = 0; t < 16; t++) w[t] = words[i + t] | 0;
    for (let t = 16; t < 64; t++) {
      w[t] = (gamma1(w[t - 2]) + w[t - 7] + gamma0(w[t - 15]) + w[t - 16]) | 0;
    }

    let a = H0;
    let b = H1;
    let c = H2;
    let d = H3;
    let e = H4;
    let f = H5;
    let g = H6;
    let h = H7;

    for (let t = 0; t < 64; t++) {
      const T1 = (h + sigma1(e) + ch(e, f, g) + K[t] + w[t]) | 0;
      const T2 = (sigma0(a) + maj(a, b, c)) | 0;
      h = g;
      g = f;
      f = e;
      e = (d + T1) | 0;
      d = c;
      c = b;
      b = a;
      a = (T1 + T2) | 0;
    }

    H0 = (H0 + a) | 0;
    H1 = (H1 + b) | 0;
    H2 = (H2 + c) | 0;
    H3 = (H3 + d) | 0;
    H4 = (H4 + e) | 0;
    H5 = (H5 + f) | 0;
    H6 = (H6 + g) | 0;
    H7 = (H7 + h) | 0;
  }

  const hex = (n: number) => {
    const s = (n >>> 0).toString(16);
    return "00000000".substring(s.length) + s;
  };

  return (
    hex(H0) +
    hex(H1) +
    hex(H2) +
    hex(H3) +
    hex(H4) +
    hex(H5) +
    hex(H6) +
    hex(H7)
  );
}
