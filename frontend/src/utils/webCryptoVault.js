/**
 * WebCryptoVault.js
 * Zero-Knowledge Client-Side Encryption Helper using Web Crypto API (AES-256-GCM + PBKDF2)
 */

// Derive AES-GCM Key from User Passphrase & Salt
async function deriveKey(passphrase, salt) {
  const enc = new TextEncoder();
  const keyMaterial = await window.crypto.subtle.importKey(
    "raw",
    enc.encode(passphrase),
    "PBKDF2",
    false,
    ["deriveKey"]
  );

  return window.crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: enc.encode(salt),
      iterations: 100000,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

/**
 * Encrypts a file using AES-256-GCM in browser
 * @returns {Promise<{ encryptedFile: File, ivHex: string }>}
 */
export async function encryptFileClientSide(file, passphrase) {
  const arrayBuffer = await file.arrayBuffer();
  const salt = "CloudVault_Salt_" + file.name;
  const iv = window.crypto.getRandomValues(new Uint8Array(12)); // 96-bit IV

  const key = await deriveKey(passphrase, salt);
  const encryptedBuffer = await window.crypto.subtle.encrypt(
    {
      name: "AES-GCM",
      iv: iv,
    },
    key,
    arrayBuffer
  );

  const ivHex = Array.from(iv).map(b => b.toString(16).padStart(2, '0')).join('');
  const encryptedBlob = new Blob([encryptedBuffer], { type: "application/octet-stream" });
  const encryptedFile = new File([encryptedBlob], file.name + ".enc", { type: "application/octet-stream" });

  return { encryptedFile, ivHex };
}

/**
 * Decrypts raw encrypted ArrayBuffer back to original Blob
 */
export async function decryptFileClientSide(encryptedBuffer, passphrase, filename, ivHex) {
  const salt = "CloudVault_Salt_" + filename.replace(/\.enc$/, "");
  const iv = new Uint8Array(ivHex.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));

  const key = await deriveKey(passphrase, salt);
  const decryptedBuffer = await window.crypto.subtle.decrypt(
    {
      name: "AES-GCM",
      iv: iv,
    },
    key,
    encryptedBuffer
  );

  return new Blob([decryptedBuffer]);
}
