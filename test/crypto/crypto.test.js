'use strict';
const cryptoLib = require('../../crypto');
const crypto = require('crypto');
const { expect } = require('chai');

describe('encrypt and decrypt', () => {
  it('should encrypt a string with AES-GCM', async () => {
    const key = crypto.randomBytes(32);
    const crypt = cryptoLib(key, 'aes-256-gcm');
    const plaintext = "encrypt me";
    const cipherText = crypt.encrypt(plaintext);

    const parts = cipherText.split(':');
    expect(parts.length).equal(4);
  });

  it('should encrypt a string with AES-CBC', async () => {
    const key = crypto.randomBytes(32);
    const crypt = cryptoLib(key, 'aes-256-cbc');
    const plaintext = "encrypt me";
    const cipherText = crypt.encrypt(plaintext);

    const parts = cipherText.split(':');
    expect(parts.length).equal(4);
  });

  it('should decrypt a string with AES-GCM', async () => {
    const key = crypto.randomBytes(32);
    const crypt = cryptoLib(key, 'aes-256-gcm');
    const plaintext = "1234-4323-4234-1234";
    const cipherText = crypt.encrypt(plaintext);

    const result = crypt.decrypt(cipherText);
    expect(result).equal(plaintext);
  });

  it('should decrypt a string with AES-CBC', async () => {
    const key = crypto.randomBytes(32);
    const crypt = cryptoLib(key, 'aes-256-cbc');
    const plaintext = "1234-4323-4234-1234";
    const cipherText = crypt.encrypt(plaintext);

    const result = crypt.decrypt(cipherText);
    expect(result).equal(plaintext);
  });
});