'use strict';
const ObjectionEncryption = require('./');
const { Model } = require('objection');
const Knex = require('knex');
const { expect } = require('chai');

const Encryption = ObjectionEncryption({
  fields: ['ssn']
});

describe('encrypt and decrypt fields', () => {
  let knex;
  const testSsn = '123786skdfhs87';

  before(() => {
    knex = Knex({
      client: 'sqlite3',
      useNullAsDefault: true,
      connection: {
        filename: './test.db',
      },
    });
  });

  before(() => {
    return knex.schema.createTable('Account', (table) => {
      table.increments('id').primary();
      table.string('name');
      table.string('ssn');
    });
  });

  after(() => {
    return knex.schema.dropTable('Account');
  });

  after(() => {
    return knex.destroy();
  });

  beforeEach(() => {
    return knex('Account').delete();
  });

  it('should insert an encrypted record to the database', async () => {
    class Account extends Encryption(Model) {
      static get tableName() {
        return 'Account';
      }
    }

    const insertResult = await Account.query(knex)
      .insert({ name: 'Jennifer', ssn: testSsn })

    const resultSsn = insertResult.ssn
    expect(resultSsn).to.not.equal(testSsn);
        
    const parts = resultSsn.split(':');
    expect(parts.length).equal(3);
  });

  it('should find and decrypt an encrypted record', async () => {
    class Account extends Encryption(Model) {
      static get tableName() {
        return 'Account';
      }
    }

    const testAccount = await Account.query(knex)
      .insert({ name: 'Jennifer', ssn: testSsn });

    const findResult = await Account.query(knex).findById(testAccount.id);

    expect(findResult.ssn).equal(testSsn);
  });
});