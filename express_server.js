const express = require('express');
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");

const generateRandomString = (length) => {
  let string = '';
  let possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (let i = 0; i < length; i++){
    string += possible.charAt(Math.floor(Math.random()*(possible.length - 1)));
  }
  return string;
}

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

//home page
app.get("/", (req, res) => {
  // debugger;
  res.send("Hello!");
  res.end();
});

//displaying page of all shortURL : longURL
app.get("/urls", (req, res) => {
  let templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars)
});

//delivering url obj in JSON
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

//displaying add new url page
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

//add a new short URL given long URL
app.post("/urls/new", (req, res) =>{
  const shortURL = generateRandomString(6);
  urlDatabase[shortURL] = `http://${req.body.longURL}`;
  res.redirect(`/urls/${shortURL}`);
});

//displaying invidual shortURL : longURL pairs given shortURL
app.get("/urls/:id", (req, res) => {
  let templateVars = { shortURL: req.params.id,
                     longURL: urlDatabase[req.params.id] };
  res.render("urls_show", templateVars);
});

//deleting entry
app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect("/urls");
});

//updating longURL given shortURL and new longURL
app.post("/urls/:id/update", (req, res) => {
  console.log(req.params.id);
  console.log(req.body);
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