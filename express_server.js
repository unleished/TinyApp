const express = require('express');
const app = express();
const cookieParser = require('cookie-parser');
app.use(cookieParser());

const PORT = process.env.PORT || 8080;

app.set('view engine', 'ejs');

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
}

function validateLogin(email, password) {
  for (user in users) {
    if (users[user].email === email && users[user].password === password) {
      return users[user].id;
    }
  }
  return false;
}

function generateRandomString() {
  let randomChar = '';
  let randomString = 'KikidoyoulovemeAreyouridingSayyoullnevereverleavefrombesidemeCauseiwantyaandineedya0123456789';
    for (let i = 0; i < 6; i++) {
      randomChar += randomString[Math.floor(Math.random() * 93)]
    }
  return randomChar;
}

app.get('/register', (req, res) => {
  let templateVars = {
    urls: urlDatabase,
    userID: '',
    pageID: 'reg'
  };
  if (req.cookies['userID']) {
    templateVars.userID = users[req.cookies.userID]
  }
  res.render('register', templateVars);
});

app.post('/register', (req, res) => {
  if (!req.body.email || !req.body.password) {
    res.sendStatus(400);
  } else {
    let randomID = generateRandomString();
    users[randomID] = {
      id: randomID,
      email: req.body.email,
      password: req.body.password
    };
    res.cookie('userID', randomID);
    res.redirect('/urls');
  }
});

app.get('/login', (req, res) => {
  let templateVars = {
    urls: urlDatabase,
    userID: '',
    pageID: 'login'
  };
  if (req.cookies['userID']) {
    templateVars.userID = users[req.cookies.userID]
  };
  res.render('login', templateVars);
});

app.post('/login', (req, res) => {

  let userID = validateLogin(req.body.email, req.body.password)

  if (userID) {
    let templateVars = {
      urls: urlDatabase,
      userID: userID,
      pageID: '',
    };
    res.cookie('userID', userID);
    res.redirect('/urls');
  } else {
    res.status(403).send('Please check your login credentials')
  }
});


app.get('/urls', (req, res) => {
  let templateVars = {
    urls: urlDatabase,
    userID: '',
    pageID: ''
  };
  if (req.cookies['userID']) {
    templateVars.userID = users[req.cookies.userID]
  };
  res.render('urls_index', templateVars);
});

app.get('/urls/new', (req, res) => {
  let templateVars = {
    urls: urlDatabase,
    userID: '',
    pageID: ''
  };
  if (req.cookies['userID']) {
    templateVars.userID = users[req.cookies.userID]
  }
  res.render('urls_new', templateVars);
});

app.get("/urls/:id", (req, res) => {
  let templateVars = {
    id: req.params.id,
    urls: urlDatabase[req.params.id],
    userID: '',
    pageID: ''
  };
  if (req.cookies['userID']) {
    templateVars.userID = users[req.cookies.userID]
  }
  res.render("urls_show", templateVars);
});

app.post('/urls', (req, res) => {
  let urlId = generateRandomString();
  urlDatabase[urlId] = req.body.longURL;
  res.redirect('/urls/'+urlId);
});

app.get('/u/:shortUrl', (req, res) => {
  let longURL = urlDatabase[req.params.shortUrl];
  res.redirect(longURL);
});

app.post('/urls/:id', (req, res) => {
  urlDatabase[req.params.id] = req.body.longURL
  let templateVars = {
    id: req.params.id,
    urls: urlDatabase[req.params.id],
    userID: ''
  };
  if (req.cookies['userID']) {
    templateVars.userID = users[req.cookies.userID]
  }
  res.redirect('/urls/'+req.params.id);
});

app.post('/urls/:id/delete', (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect('/urls/');
});

app.get('/hello', (req, res) => {
  res.end('<html><body>Hello <b>World</b></body></html>\n');
});

app.post('/logout', (req, res) => {
  res.clearCookie('userID');
  res.redirect('/urls');
});

app.get('/', (req, res) => {
  let templateVars = {
    urls: urlDatabase,
    userID: '',
    pageID: ''
  };
  if (req.cookies.userID) {
    templateVars.userID = req.cookies.userID
  }
  res.redirect('/urls/', templateVars);
});

app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
