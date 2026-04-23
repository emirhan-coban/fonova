import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12;
const TAG_LENGTH = 16;

function getEncryptionKey(): Buffer {
  const key = process.env.ENCRYPTION_KEY;
  if (!key || key.length !== 64) {
    throw new Error(
      "ENCRYPTION_KEY ortam değişkeni 64 karakter hex (32 byte) olmalıdır."
    );
  }
  return Buffer.from(key, "hex");
}

export function encrypt(plaintext: string): string {
  const key = getEncryptionKey();
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, key, iv);

  const encrypted = Buffer.concat([
    cipher.update(plaintext, "utf8"),
    cipher.final()
  ]);

  const tag = cipher.getAuthTag();

  // Format: iv:tag:ciphertext (all base64)
  return [
    iv.toString("base64"),
    tag.toString("base64"),
    encrypted.toString("base64")
  ].join(":");
}

export function decrypt(encryptedValue: string): string {
  const key = getEncryptionKey();
  const parts = encryptedValue.split(":");

  if (parts.length !== 3) {
    throw new Error("Geçersiz şifreli veri formatı.");
  }

  const [ivB64, tagB64, dataB64] = parts;
  const iv = Buffer.from(ivB64, "base64");
  const tag = Buffer.from(tagB64, "base64");
  const encrypted = Buffer.from(dataB64, "base64");

  if (iv.length !== IV_LENGTH || tag.length !== TAG_LENGTH) {
    throw new Error("Geçersiz IV veya auth tag uzunluğu.");
  }

  const decipher = createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(tag);

  const decrypted = Buffer.concat([
    decipher.update(encrypted),
    decipher.final()
  ]);

  return decrypted.toString("utf8");
}

export function isEncrypted(value: string): boolean {
  const parts = value.split(":");
  if (parts.length !== 3) return false;
  try {
    const iv = Buffer.from(parts[0], "base64");
    return iv.length === IV_LENGTH;
  } catch {
    return false;
  }
}
