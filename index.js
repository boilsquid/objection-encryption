'use strict';
const crypto = require('crypto');
const p = require('phin');

const generateIv = () => {
  return crypto.randomBytes(16);
}

const encrypt = (str, key) => {
  const iv = generateIv()
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);

  let enc1 = cipher.update(str, 'utf8');
  let enc2 = cipher.final();

  return `enc:v1:${iv.toString('base64')}:${Buffer.concat([enc1, enc2, cipher.getAuthTag()]).toString("base64")}`;
};

const decrypt = (enc, key) => {
  const parts = enc.split(':');
  const iv = Buffer.from(parts[2], 'base64');
  const encValue = Buffer.from(parts[3], 'base64')
  const tag = encValue.subarray(encValue.length - 16);
  const cipherText = encValue.subarray(0, encValue.length - 16);
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(tag);
  let str = decipher.update(cipherText, null, 'utf8');
  str += decipher.final('utf8');
  return str;
};

const getKeyFromVault = async (vaultOptions) => {
  const result = await p({
    url: `http://${vaultOptions.hostname}/v1/transit/export/encryption-key/${vaultOptions.keyName}/${vaultOptions.keyVersion}`,
    method: 'GET',
    headers: {
      'X-Vault-Token': vaultOptions.token
    },
    parse: 'json'
  });
  const encodedKey = result.body.data.keys[vaultOptions.keyVersion]
  const decodedKey = Buffer.from(encodedKey, 'base64');
  return decodedKey;
}

module.exports = options => {
  let key;

  if (options.vault) {
    getKeyFromVault(options.vault).then(res => key = res);
  } else {
    key = process.env.ENC_ROOT_KEY
  }

  return Model => {
    return class extends Model {
      $beforeInsert(context) {
        super.$beforeInsert(context);
        
        this.mutateOptionFields(encrypt);
      }

      $beforeUpdate(context) {
        super.$beforeInsert(context);

        this.mutateOptionFields(encrypt);
      }

      $afterFind(context) {
        super.$afterFind(context);

        this.mutateOptionFields(decrypt);
      }

      mutateOptionFields(mutator) {
        const fields = Object.keys(this);
        for (let i = 0; i < fields.length; i++) {
          if(options.fields.includes(fields[i])) {
            const toMutate = this[fields[i]];
            this[fields[i]] = mutator(toMutate, key);
          }
        }
      }
    }
  }
};