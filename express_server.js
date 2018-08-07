const express = require('express');
const app = express();
const PORT = 8080;

app.set('view engine', 'ejs');

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

function generateRandomString() {
  let randomChar = '';
  let randomString = 'KikidoyoulovemeAreyouridingSayyoullnevereverleavefrombesidemeCauseiwantyaandineedya0123456789';
  for (let i = 0; i < 7; i++) {
    randomChar += randomString[Math.floor(Math.random() * 10)]
  }
// let randomNum = Math.floor(Math.random() * 10)
// let randomChar = randomString.charAt(randomNum)
return randomChar;
}

console.log(generateRandomString());

app.get('/urls', (req, res) => {
  let templateVars = { urls: urlDatabase };
  res.render('urls_index', templateVars);
});

app.get('/urls/new', (req, res) => {
  res.render('urls_new');
});

app.get("/urls/:id", (req, res) => {
  let templateVars = { id: req.params.id, urls: urlDatabase[req.params.id] };
  console.log('params: ', req.params);
  res.render("urls_show", templateVars);
});

app.post('/urls', (req, res) => {
  console.log(req.body);
  res.send('Ok');
});

app.get('/', (req, res) => {
  res.end('Hello!');
});

app.get('/hello', (req, res) => {
  res.end('<html><body>Hello <b>World</b></body></html>\n');
});

app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
