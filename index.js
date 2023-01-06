'use strict';
const cryptoLib = require('./crypto');
const p = require('phin');

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

const initKey = async (options) => {
  if (options.vault) {
    return await getKeyFromVault(options.vault)
  } else if (options.aesKey) {
    return options.aesKey  
  } else {
    if (process.env.ENC_ROOT_KEY === undefined) {
      throw new Error('No encryption key provided');
    }
    return process.env.ENC_ROOT_KEY
  }
}

module.exports = (options) => {
  const encryptionKey = initKey(options);
  const crypto = cryptoLib(encryptionKey);
  
  return Model => {
    return class extends Model {
      $beforeInsert(context) {
        super.$beforeInsert(context);
        
        this.mutateOptionFields(crypto.encrypt);
      }

      $beforeUpdate(context) {
        super.$beforeInsert(context);

        this.mutateOptionFields(crypto.encrypt);
      }

      $afterFind(context) {
        super.$afterFind(context);

        this.mutateOptionFields(crypto.decrypt);
      }

      mutateOptionFields(mutator) {
        const fields = Object.keys(this);
        for (let i = 0; i < fields.length; i++) {
          if(options.fields.includes(fields[i])) {
            const toMutate = this[fields[i]];
            this[fields[i]] = mutator(toMutate);
          }
        }
      }
    }
  }
};