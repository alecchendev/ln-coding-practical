/**
 * Performs byte-wise exclusive-OR on two buffers of equal length returning
 * a new Buffer. Throws when the buffers are not equal length.
 * @param a
 * @param b
 * @returns
 */
export function xor(a: Buffer, b: Buffer): Buffer {
    const result = Buffer.alloc(Math.max(a.length, b.length));
    for (let i = 0; i < result.length; i++) {
        if (i < a.length && i < b.length) {
            result[i] = a[i] ^ b[i];
        } else if (i < a.length) {
            result[i] = a[i];
        } else if (i < b.length) {
            result[i] = b[i];
        }
    }
    return result;
}
