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

var users = {
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
  "b2xVn2": {
    url: "http://www.lighthouselabs.ca",
    userID: "3Jsq2"
  },
  "9sm5xK": {
    url: "http://www.google.com",
    userID: "m4K13"
  }
};

//home page
app.get("/", (req, res) => {
  let templateVars = {user_id: req.cookies.user_id};
  res.render('landing', templateVars);
});

//registration
app.get("/register", (req, res) => res.render('register'));

app.post("/register", (req, res) => {
  if(!req.body.email || !req.body.password){
    res.status(404);
    res.end('<html><head></head><body><p>You need to enter both an email and a password</p><button onclick="window.history.back();">Go Back</button></body></html>')
  } else {
    let new_id = generateRandomString(5);
    let new_user = {
      'id' : new_id,
      'email' : req.body.email,
      'password' : req.body.password
    };
    users[new_id] = new_user;
    res.cookie('user_id', new_id);
    res.redirect("/");
  }
});

//login
app.get("/login", (req, res) => {
  if(!users[req.cookies.user_id]) {
    res.render('login');
  } else {
    res.redirect('/urls');
  }
});

app.post("/login", (req, res) => {
  let input_email = req.body.email;
  let input_password = req.body.password;

  for (var entry in users) {
    let entry_email = users[entry.toString()].email;
    let entry_password = users[entry.toString()].password;
    if(input_email == entry_email && input_password == entry_password){
      res.cookie('user_id', users[entry.toString()].id);
      res.redirect('/urls');
    } else if(input_email == entry_email) {
      res.status(403);
    } else {
      res.status(403);
    }
  }
  res.end('<html><head></head><body><p>The email and password combo you have entered does not match any registered user.</p><button onclick="window.history.back();">Go Back</button></body></html>')
});

//logout
app.post("/logout", (req, res) => {
  res.clearCookie('user_id');
  res.redirect("/");
});

//displaying page of all shortURL : longURL
app.get("/urls", (req, res) => {
  let templateVars = {
    urls: urlDatabase,
    user_id: req.cookies["user_id"]
  };
  res.render("urls_index", templateVars);
});

//delivering url obj in JSON
app.get("/urls.json", (req, res) => {res.json(urlDatabase)});

//delivering users obj in JSON
app.get("/users.json", (req, res) => {res.json(users)});

//displaying add new url page
app.get("/urls/new", (req, res) => {
  let templateVars = {user_id: req.cookies["user_id"]};
  if(!users[templateVars.user_id]){
    res.redirect("/login");
  }
  res.render("urls_new", templateVars);
});

//add a new short URL given long URL
app.post("/urls/new", (req, res) =>{
  let shortURL = generateRandomString(6);
  urlDatabase[shortURL] = {
    url: `http://${req.body.longURL}`,
    user_id: req.cookies.user_id
  };
  res.redirect(`/urls/${shortURL}`);
});

//displaying invidual shortURL : longURL pairs given shortURL
app.get("/urls/:id", (req, res) => {
  let templateVars = {
    shortURL: req.params.id,
    longURL: urlDatabase[req.params.id].url,
    user_id: req.cookies.user_id
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
  urlDatabase[req.params.id] = {
    url: `http://req.body.updateURL;`,
    user_id: req.cookies.user_id
  }
  res.redirect("/urls");
});

//redirecting to longURL given shortURL
app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL].url;
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