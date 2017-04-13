const express = require('express');
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser')

const generateRandomString = (length) => {
  let string = '';
  let possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (let i = 0; i < length; i++){
    string += possible.charAt(Math.floor(Math.random()*(possible.length - 1)));
  }
  return string;
}

const app = express();
const PORT = 8080;

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

const users = {
  "m4K13": {
    id: "m4K13",
    email: "user@example.com",
    password: "password"
  },
 "3Jsq2": {
    id: "3Jsq2",
    email: "bob@bob.com",
    password: "password"
  }
}

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

//home page
app.get("/", (req, res) => {
  // let templateVars = {username: req.cookies["username"]};
  res.render('landing');
});

//registration
app.get("/register", (req, res) => res.render('register'));

app.post("/register", (req, res) => {
  let new_id = generateRandomString(5);
  let new_user = {
    'id' : new_id,
    'email' : req.body.email,
    'password' : req.body.password
  };
  users[new_id] = new_user;
  res.redirect("/urls");
});

//login
app.post("/login", (req, res) => {
  res.cookie('username', req.body.username);
  res.redirect('/urls');
});

//logout
app.post("/logout", (req, res) => {
  res.clearCookie('username');
  res.redirect("/");
});

//displaying page of all shortURL : longURL
app.get("/urls", (req, res) => {
  let templateVars = {
    urls: urlDatabase,
    username: req.cookies["username"]
  };
  res.render("urls_index", templateVars);
});

//delivering url obj in JSON
app.get("/urls.json", (req, res) => {res.json(urlDatabase)});

//displaying add new url page
app.get("/urls/new", (req, res) => {
  let templateVars = {username: req.cookies["username"]};
  res.render("urls_new", templateVars);
});

//add a new short URL given long URL
app.post("/urls/new", (req, res) =>{
  const shortURL = generateRandomString(6);
  urlDatabase[shortURL] = `http://${req.body.longURL}`;
  res.redirect(`/urls/${shortURL}`);
});

//displaying invidual shortURL : longURL pairs given shortURL
app.get("/urls/:id", (req, res) => {
  let templateVars = {
    shortURL: req.params.id,
    longURL: urlDatabase[req.params.id],
    username: req.cookies["username"]
  };
  res.render("urls_show", templateVars);
});

//deleting entry
app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect("/urls");
});

//updating longURL given shortURL and new longURL
app.post("/urls/:id/update", (req, res) => {
  urlDatabase[req.params.id] = `http://req.body.updateURL;`
  res.redirect("/urls");
});

//redirecting to longURL given shortURL
app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

//catch all for all get requests
app.get('/*', (req, res) => {
  res.status(404);
  res.send(`404 page not found: ${req.method} ${req.url} is not valid`)
});

//catch all for all post requests
app.post('/*', (req, res) => {
  res.status(404);
  res.send(`404 page not found: ${req.method} ${req.url} is not valid`)
});

app.listen(PORT, () => {
  console.log(`Example app listening on PORT: ${PORT}`);
});