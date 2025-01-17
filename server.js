var db = require("./database/database.js");
const express = require("express");
const cors = require("cors");

const bcrypt = require("bcryptjs");
const solr = require("solr-node");
const jwt = require("jsonwebtoken");
// const cookieParser = require("cookie-parser");

const SECRET_KEY =
  "ef700ad7767d6be1db72b471e73c58590a247764b1a8870703c3e4d54f857be9d3e65e5bc25bfb4528388ef642cd7b4edf71dd0606df8676beb29491c5e000af"; // Make sure to use a strong secret key
const app = express();
const port = 5000;

// middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

const client = new solr({
  host: "solr", // Change from localhost to solr
  port: "8983", // Solr server port (default is 8983)
  core: "productCore", // Solr core (replace with your core name)
  protocol: "http", // Protocol (can be http or https)
});

// root
app.get("/", (req, res) => {

  res.send("Hello, world!");
});

// Search API endpoint
app.get("/api/search", (req, res) => {
  const inquery = req.query.query; // Get the search query from frontend

 
  console.log(inquery);

  // Execute the search query
  var data = client.query().q(inquery);

  client.search(data, function (err, result) {
    if (err) {
       console.log(err);
       return;
    }

    console.log('Response:', result.response.docs);

    res.json({
      message: "success",
      data: result.response.docs,
    });

 });

});

// Endpoint to get category
app.get("/api/category", (req, res) => {
  console.log("Get the request");
  var sql = "select * from category";
  var params = [];

  var v = req.query["id"];
  // for getting specific category using id ?id=1,2...
  if (v) {
    var sql = "select * from category where id=?";
    var params = [v];
    console.log("Runnig this ");
    console.log(params[0]);

    db.get(sql, params, (err, row) => {
      if (err) {
        res.status(400).json({ error: err.message });
        return;
      }
      res.json({
        message: "success",
        data: row,
      });
    });

    // for getting all categories
  } else {
    db.all("select * from category", params, (err, rows) => {
      if (err) {
        res.status(400).json({ error: err.message });
        return;
      }
      res.json({
        message: "success",
        data: rows,
      });
    });
  }
});

// for  uploading a products
app.post("/api/products", (req, res) => {
  console.log(req.body);
  var data = req.body;
  console.log(data.name);
  var sql =
    "INSERT into products(name,items,price,discount,category_id) VALUES(?,?,?,?,?)";
  var params = [
    data.name,
    data.items,
    data.price,
    data.discount,
    data.category,
  ];
  db.run(sql, params, (err) => {
    if (err) {
      return console.error;
    } else {
      console.log("Data added");
    }
  });
  res.json({
    message: "Added",
  });
});

// for  uploading a category

app.post("/api/category", (req, res) => {
  var date = new Date().toLocaleDateString();
  console.log(req.body);
  var data = req.body;
  console.log(data.name);
  var sql = "INSERT INTO category(name,date) VALUES(?,?)";
  var params = [data.name, date];
  db.run(sql, params, (err) => {
    if (err) {
      return console.error;
    } else {
      console.log("Data added");
    }
  });
  res.json({
    message: "Added",
    id: this.lastID,
    data: "data",
  });
});

// Endpoint to get product information
app.get("/api/products", (req, res) => {
  console.log("Get the request");
  var sql = "select * from products";
  var params = [];

  var v = req.query["id"];
  // for getting specific category using id ?id=1,2...
  if (v) {
    var sql = "select * from products where category_id=?";
    var params = [v];
    console.log("Runnig this ");
    console.log(params[0]);

    db.all(sql, params, (err, row) => {
      if (err) {
        res.status(400).json({ error: err.message });
        return;
      }
      res.json({
        message: "success",
        data: row,
      });
    });

    // for getting all categories
  } else {
    db.all(sql, params, (err, rows) => {
      if (err) {
        res.status(400).json({ error: err.message });
        return;
      }
      res.json({
        message: "success",
        data: rows,
      });
    });
  }
});

// for auth

app.post("/api/login", (req, res) => {
  console.log("Loging");

  const { email, password } = req.body;

  const sql = "SELECT * FROM user WHERE email = ?";
  const params = [email];

  db.get(sql, params, async (err, user) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }

    if (!user) {
      return res.status(400).json({ error: "User not found!" });
    }

    // Compare the password with the hashed password in the database
    const isPasswordValid = await bcrypt.compare(password, user.password);
    console.log(user);
    console.log(isPasswordValid);

    if (!isPasswordValid) {
      return res.status(400).json({ error: "Invalid password!" });
    }

    // Create JWT token
    const token = jwt.sign(
      { id: user.id, username: user.username },
      SECRET_KEY,
      { expiresIn: "1h" } // Token expires in 1 hour
    );

    res.json({
      message: "Login successful!",
      token: token,
      name:user.name
    });
  });
});

// Middleware to protect routes requiring authentication
function authenticateJWT(req, res, next) {
  const token = req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    return res.status(403).json({ error: "Access denied, token required!" });
  }

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) {
      return res.status(403).json({ error: "Invalid or expired token!" });
    }
    req.user = user; // Store user info in request object
    next();
  });
}

// for signup

app.post("/api/signup", async (req, res) => {
  const { name, email, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  const sql = "INSERT INTO user (name, email, password) VALUES (?, ?, ?)";
  const params = [name, email, hashedPassword];
  console.log("Hashed Password:", hashedPassword);

  db.run(sql, params, function (err) {
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    // Return a success response with user id (could also return more user info)
    res.json({
      message: "User registered successfully!",
      userId: this.lastID,
    });
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
