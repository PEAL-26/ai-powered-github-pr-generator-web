import CryptoJS from "crypto-js";

const SECRET_KEY = process.env.ENCRYPT_SECRET_KEY || "default_secret_key";

export function encryptData<T>(data: T) {
  return CryptoJS.AES.encrypt(JSON.stringify(data), SECRET_KEY).toString();
}

export function decryptData(ciphertext: string) {
  const bytes = CryptoJS.AES.decrypt(ciphertext, SECRET_KEY);
  return bytes.toString(CryptoJS.enc.Utf8).trim().replace(/^"|"$/g, "");
}
