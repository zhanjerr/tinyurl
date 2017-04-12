const express = require('express');
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");


const generateRandomString(length) => {
  let string = '';
  let possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (let i = 0; i < length; i++){
    string += possible.charAt(Math.floor(Math.random()*(possible.length - 1)));
  }
  console.log(string);
}

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get("/", (req, res) => {
  // debugger;
  res.send("Hello!");
  res.end();
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

// app.get("/hello", (req, res) => {
//   res.end("<html><body>Hello <b>World</b></body></html>\n");
// });

app.get("/urls", (req, res) => {
  let templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars)
});

app.post("/urls", (req, res) =>{
  console.log(req.body);
  res.send("ok");
});

app.get("/urls/:id", (req, res) => {
let templateVars = { shortURL: req.params.id,
                     longURL: urlDatabase[req.params.id] };
res.render("urls_show", templateVars);
});




// app.get("/urls.json", (req, res) => {
//   res.json(urlDatabase);
// });

app.listen(PORT, () => {
  console.log(`Example app listening on PORT: ${PORT}`);
});