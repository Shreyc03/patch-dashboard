const mysql = require('mysql2');

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'Bhagya@76', 
  database: 'patch_server'
});

db.connect(err => {
  if (err) throw err;
  console.log('MySQL Connected!');
});

module.exports = db;
