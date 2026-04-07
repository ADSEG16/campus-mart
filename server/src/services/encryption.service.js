const crypto = require("crypto");

const key = Buffer.from(process.env.MESSAGE_ENCRYPTION_KEY, "base64");
// Must be 32 bytes for AES-256

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

module.exports = { encryptText };
