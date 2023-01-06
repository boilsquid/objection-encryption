# Objection Encryption

<span class="badge-npmversion"><a href="https://npmjs.org/package/objection-encryption" title="View this project on NPM"><img src="https://img.shields.io/npm/v/objection-encryption.svg" alt="NPM version" /></a></span>

This is an [Objection.js](https://vincit.github.io/objection.js/) plugin that enables field level encryption and decryption of values stored in a database.

## Usage
```javascript
  // Import plugin
  const ObjectionEncryption = require('objection-encryption');

  // Create an instance with the fields that should be encrypted on insert and decrypted on find.
  const Encryption = ObjectionEncryption({
    fields: ['ssn']
  });

  // Extend your Objection Model with the Encryption instance
  class Account extends Encryption(Model) {
    static get tableName() {
      return 'Account';
    }
  }

  const insertAccount = await Account.query()
    .insert({ name: 'Jennifer', ssn: 'AAA-GG-SSSS' });
  
  console.log(insertAccount); 
  // 
  // Account {
  //   name: 'Jennifer',
  //   ssn: 'enc:v1:VUKkbuDKaTeV17MF6VzUiQ==:VWmo5uwsTbSacm13u704rjXg+lGzAZsJBdXAtgQe',
  //   id: 2
  // }
  //

  const findAccount = await Account.query()
    .findById(2);
  
  console.log(findAccount);
  // 
  // Account {
  //   name: 'Jennifer',
  //   ssn: 'AAA-GG-SSSS',
  //   id: 2
  // }
  //

```

## Configuration
You can initialize the library with several options
```js 
const crypto = require('crypto');
const ObjectionEncryption = require('objection-encryption');

// Create an instance with the fields that should be encrypted on insert and decrypted on find.
const Encryption = ObjectionEncryption({
  fields: ['ssn'],
  algorithm: 'aes-256-gcm',
  aesKey: crypto.randomBytes(32)
});
```


| Option              | Default            | Description                                                                                                                                                                                                                                       |
| ------------------- | ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `feilds` | `[]` | Fields that should be encrypted and decrypted |
| `algorithm` | `aes-256-gcm` | The encryption algorithm to use, options `aes-256-gcm` `aes-256-cbc` |
| `aesKey` | `null` | Key to use for encrytion |

## Crypto
By default `aes-256-gcm` is used for encryption that requires a `32` randomly generated key. Each encrypted value includes an `IV`, the `IV` is unique per encryption.

#### Format
Example encrypted value
```
enc:v1:VUKkbuDKaTeV17MF6VzUiQ==:VWmo5uwsTbSacm13u704rjXg+lGzAZsJBdXAtgQe
```
The value is formatted into 4 parts separated by the `:` character.
| Index              | Value            | Description |
| ------------------- | ------------------ | ----------- |
| `0` | `enc` | prefix identifier |
| `1` | `v1` | version |
| `2` | `VUKkbuDKaTeV17MF6VzUiQ==` | initialization vector (IV) (base64) |
| `3` | `VWmo5uwsTbSacm13u704rjXg+lGzAZsJBdXAtgQe` | ciphertext (base64) |

## Hashicorp Vault

`objection-encryption` can be configured to use and AES key from [Hashicorp Vault](https://developer.hashicorp.com/vault/docs). This is only compatible with the default `aes-256-gcm` algorithm.

#### Setup
You must generate an exportable key from Vault, this will assume you have Vault [installed](https://developer.hashicorp.com/vault/docs/install) on your local machine

Start Vault in Dev mode
```
vault server -dev
```

Enable transit encryption
```
vault secrets enable transit
```

`Create` a key that is exportable with the `exportable` flag set to true.
```
curl --header "X-Vault-Token: ..." \
  --request POST \
  --data '{"type": "aes256-gcm96", "exportable": true}' \
  http://127.0.0.1:8200/v1/transit/keys/objection-encryption
```

`Get` the key details
```
curl --header "X-Vault-Token: ..." \
  http://127.0.0.1:8200/v1/transit/export/encryption-key/objection-encryption/1
```

#### Note
The key returned from Vault will be base64 encoded, to pass this to `objection-encryption` in the correct format create a `Buffer` with base64 input encoding.
```javascript
  const Encryption = ObjectionEncryption({
    fields: ['ssn'],
    aesKey: Buffer.from(vaultKey, 'base64)
  });
```