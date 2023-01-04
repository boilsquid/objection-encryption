'use strict';
const crypto = require('crypto');

const ENC_ROOT_KEY = process.env.ENC_ROOT_KEY;

const generateIv = () => {
  return crypto.randomBytes(16);
}

const encrypt = (value) => {
  const iv = generateIv();
  const cipher = crypto.createCipheriv('aes-256-cbc', ENC_ROOT_KEY, iv);
  let encrypted = cipher.update(value, 'utf8', 'base64');
  encrypted += cipher.final('base64');
  return 'enc' + ':' + iv.toString('base64') + ':' + encrypted;
}

const decrypt = (value) => {
  const parts = value.split(':');
  const iv = Buffer.from(parts[1], 'base64');
  const encValue = parts[2];
  const decipher = crypto.createDecipheriv('aes-256-cbc', ENC_ROOT_KEY, iv);
  let decrypted = decipher.update(encValue, 'base64', 'utf8');
  return (decrypted + decipher.final('utf8'));
}

module.exports = options => {
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
            this[fields[i]] = mutator(toMutate);
          }
        }
      }
    }
  }
};