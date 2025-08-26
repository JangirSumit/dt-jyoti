'use strict';

// Choose DB client via env: sqlite (default) or mssql
const client = (process.env.DB_CLIENT || 'sqlite').toLowerCase();

let adapter;
switch (client) {
  case 'sqlite':
    adapter = require('./db-sqlite');
    break;
  case 'mssql':
  case 'sqlserver':
    adapter = require('./db-mssql');
    break;
  default:
    throw new Error(`Unsupported DB_CLIENT '${client}'. Use 'sqlite' or 'mssql'.`);
}

module.exports = {
  init: adapter.init,
  getDb: adapter.getDb,
  client
};
