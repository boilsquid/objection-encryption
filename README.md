# Objection Encryption
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
  //   ssn: 'enc:XX+9B5624XevryfUnJew==:olJo1Uv3XCzv1ZRCW5Toiw==',
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
