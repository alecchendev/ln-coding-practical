import crypto from "crypto";

export function sha256(buffer: Buffer): Buffer {
    const hash = crypto.createHash("sha256");
    hash.update(buffer);
    return hash.digest();
}
