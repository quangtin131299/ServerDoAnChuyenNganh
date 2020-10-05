const express = require("express");
const mysql = require("mysql");
const bodyParser = require("body-parser");
const app = express();
const conn = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "qlbenhnhan",
  port: 3308,
});

app.listen(process.env.PORT || 3000);

app.get("/", function(req, res) {
  conn.query("SELECT * FROM benhnhan", function(err, result) {
      res.json(result);
  });
});

app.get("/search", function(req, res) {
    console.log(req.query);
});
  



