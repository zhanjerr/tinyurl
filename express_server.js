const express = require('express');
const bodyParser = require("body-parser");
const cookieSession = require('cookie-session')
const bcrypt = require('bcrypt');

const generateRandomString = (length) => {
  let string = '';
  let possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (let i = 0; i < length; i++){
    string += possible.charAt(Math.floor(Math.random()*(possible.length - 1)));
  }
  return string;
}

const urlsForUser = (id) => {
  let user_urls = {};
  for (let entry in urlDatabase){
    if(id == urlDatabase[entry].userID)
      user_urls[entry.toString()] = urlDatabase[entry];
  }
  return user_urls;
}

const emailExists = (input_email) => {
  let result = false
  Object.keys(users).forEach(user => {
    if (input_email === users[user].email){
      result = true;
    }
  });
  return result;
}

const app = express();
const PORT = 8080;

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: 'session',
  keys: ['1kjb2Mj4KN23lb']
}));

var users = {
  "m4K13": {
    id: "m4K13",
    email: "user@example.com",
    password: "$2a$10$jYKbhq.FrUkV1kFHMREjpO0k2rvUUr3wncP4VwkZjymUw27cppcz."
  },
 "3Jsq2": {
    id: "3Jsq2",
    email: "bob@bob.com",
    password: "$2a$10$jYKbhq.FrUkV1kFHMREjpO0k2rvUUr3wncP4VwkZjymUw27cppcz."
  }
}

const urlDatabase = {
  "b2xVn2": {
    url: "http://www.lighthouselabs.ca",
    userID: "3Jsq2"
  },
  "9sm5xK": {
    url: "http://www.google.com",
    userID: "3Jsq2"
  }
};


//home page
app.get("/", (req, res) => {
  res.redirect('/urls');
});

//registration
app.get("/register", (req, res) => res.render('register'));

app.post("/register", (req, res) => {
  if(!req.body.email || !req.body.password){
    res.status(404);
    res.end('<html><head></head><body><p>You need to enter both an email and a password</p><button onclick="window.history.back();">Go Back</button></body></html>')
  } else if(emailExists(req.body.email)) {
    res.end('<html><head></head><body><p>You are already an user, please login instead.</p><button onclick="window.history.back();">Go Back</button></body></html>')
  } else{
    let new_id = generateRandomString(5);
    let new_user = {
      'id' : new_id,
      'email' : req.body.email,
      'password' : bcrypt.hashSync(req.body.password, 10)
    };
    users[new_id] = new_user;
    req.session.user_id = new_id;
    res.redirect("/");
  }
});

//login
app.get("/login", (req, res) => {
  if(!users[req.session.user_id]) {
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
    if(input_email == entry_email && bcrypt.compareSync(input_password,entry_password)){
      req.session.user_id = users[entry.toString()].id;
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
  req.session = null;
  res.redirect("/");
});

//displaying page of all shortURL : longURL
app.get("/urls", (req, res) => {
  let templateVars = {
    urls: urlsForUser(req.session.user_id),
    userID: req.session.user_id
  };
  res.render("urls_index", templateVars);
});

//delivering url obj in JSON
app.get("/urls.json", (req, res) => {res.json(urlDatabase)});

//delivering users obj in JSON
app.get("/users.json", (req, res) => {res.json(users)});

//displaying add new url page
app.get("/urls/new", (req, res) => {
  let templateVars = {userID: req.session.user_id};
  if(!users[templateVars.userID]){
    res.redirect("/login");
  }
  res.render("urls_new", templateVars);
});

//add a new short URL given long URL
app.post("/urls/new", (req, res) =>{
  let shortURL = generateRandomString(6);
  urlDatabase[shortURL] = {
    url: `http://${req.body.longURL}`,
    userID: req.session.user_id
  };
  res.redirect(`/urls/${shortURL}`);
});

//displaying invidual shortURL : longURL pairs given shortURL
app.get("/urls/:id", (req, res) => {
  let templateVars = {
    shortURL: req.params.id,
    longURL: urlDatabase[req.params.id].url,
    userID: req.session.user_id
  };
  res.render("urls_show", templateVars);
});

//deleting entry
app.post("/urls/:id/delete", (req, res) => {
  if (req.session.user_id.toString() === urlDatabase[req.params.id].userID.toString()){
    delete urlDatabase[req.params.id];
    res.redirect("/urls");
  } else {
    res.status(403);
    res.end('<html><head></head><body><p>403: You are attempting an action you are not allowed to do!</p><button onclick="window.history.back();">Go Back</button></body></html>');
  }
});

//updating longURL given shortURL and new longURL
app.post("/urls/:id/update", (req, res) => {
  if (req.session.user_id.toString() === urlDatabase[req.params.id].userID.toString()){
    urlDatabase[req.params.id] = {
      url: `http://${req.body.updateURL};`,
      userID: req.session.user_id
    }
    res.redirect("/urls");
  } else {
    res.status(403);
    res.end('<html><head></head><body><p>403: You are attempting an action you are not allowed to do!</p><button onclick="window.history.back();">Go Back</button></body></html>');
  }
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