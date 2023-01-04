# Objection Encrypt
This is an [Objection.js](https://vincit.github.io/objection.js/) plugin that enables field level encryption and decryption of values stored in a database.

# Usage
```javascript
  // Import plugin
  const ObjectionEncryption = require('objection-encryption');

  // Create and instance with the fields that should be encrypted on insert and decrypted on find.
  const Encryption = ObjectionEncryption({
    fields: ['ssn']
  });

  // Extend your Objection Model with the Encryption instance
  class Account extends Encryption(Model) {
    static get tableName() {
      return 'Account';
    }
  }

```
