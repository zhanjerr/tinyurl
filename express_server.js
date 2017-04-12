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

app.get("/", (req, res) => {
  // debugger;
  res.send("Hello!");
  res.end();
});

app.get("/urls", (req, res) => {
  let templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars)
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.post("/urls/new", (req, res) =>{
  const shortURL = generateRandomString(6);
  urlDatabase[shortURL] = `http://${req.body.longURL}`;
  res.redirect(`/urls/${shortURL}`);
});

app.get("/urls/:id", (req, res) => {
  let templateVars = { shortURL: req.params.id,
                     longURL: urlDatabase[req.params.id] };
  res.render("urls_show", templateVars);
});

app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect("/urls");
});

app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.get('/*', (req, res) => {
  res.status(404);
  res.send(`404 page not found: ${req.method} ${req.url} is not valid`)
})

app.listen(PORT, () => {
  console.log(`Example app listening on PORT: ${PORT}`);
});