const crypto = require("crypto");

const keyFromEnv = process.env.MESSAGE_ENCRYPTION_KEY;

if (!keyFromEnv) {
  throw new Error("Missing MESSAGE_ENCRYPTION_KEY. Set a base64-encoded 32-byte key in your environment.");
}

const key = Buffer.from(keyFromEnv, "base64");

if (key.length !== 32) {
  throw new Error("Invalid MESSAGE_ENCRYPTION_KEY. Expected a base64-encoded 32-byte key for AES-256-GCM.");
}

const encryptText = (plainText) => {
  const iv = crypto.randomBytes(12);

  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);

  const encrypted = Buffer.concat([
    cipher.update(plainText, "utf8"),
    cipher.final(),
  ]);

  const authTag = cipher.getAuthTag();

  return {
    ciphertext: encrypted.toString("base64"),
    iv: iv.toString("base64"),
    authTag: authTag.toString("base64"),
  };
};

const decryptText = ({ ciphertext, iv, authTag }) => {
  const decipher = crypto.createDecipheriv(
    "aes-256-gcm",
    key,
    Buffer.from(iv, "base64"),
  );

  decipher.setAuthTag(Buffer.from(authTag, "base64"));

  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(ciphertext, "base64")),
    decipher.final(),
  ]);

  return decrypted.toString("utf8");
};

module.exports = { encryptText, decryptText };
