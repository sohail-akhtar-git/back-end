var sqlite3 = require("sqlite3").verbose();


const DBSOURCE = "./database.sqlite";

let db = new sqlite3.Database(DBSOURCE, (err) => {
  return "Error";
});






db.run(
  `CREATE TABLE category (id INTEGER PRIMARY KEY AUTOINCREMENT,name text,date text)`,
  (err) => {
    if (err) {
      return console.error;
    }else{
      console.log("cat db ");
    }
  }
);


db.run(
  `CREATE TABLE user (id INTEGER PRIMARY KEY AUTOINCREMENT,name text,email text,password text)`,
  (err) => {
    if (err) {
      return console.error;
    }else{
      console.log("cat db ");
    }
  }
);

db.run(
  `CREATE TABLE products (id INTEGER PRIMARY KEY AUTOINCREMENT,name text,items INT , price INT, discount INT,category_id INTEGER,FOREIGN KEY(category_id) REFERENCES category(id))`,
  (err) => {
    if (err) {
      return console.error;
    }else{
      console.log("Product db ");
    }
  }
);






module.exports = db;
