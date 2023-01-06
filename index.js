'use strict';

module.exports = (options) => {
  const defaultOptions = {
    algorithm: 'aes-256-gcm',
    fields: [],
    aesKey: options.aesKey || process.env.ENC_ROOT_KEY
  }

  options = {...defaultOptions, ...options};

  const crypto = require('./crypto')(options.aesKey, options.algorithm);

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