const express = require('express');
const app = express();
const PORT = 8080;

app.set("view engine", "ejs");

let urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get("/", (req, res) => {
  // debugger;
  res.send("Hello!");
  res.end();
});

// app.get("/hello", (req, res) => {
//   res.end("<html><body>Hello <b>World</b></body></html>\n");
// });

app.get("/urls", (req, res) => {
  let templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars)
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