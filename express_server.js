const express = require('express');
const app = express();
const cookieParser = require('cookie-parser');
app.use(cookieParser());

const bcrypt = require('bcrypt');

const PORT = process.env.PORT || 8080;

app.set('view engine', 'ejs');

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

// bcrypt.compareSync("purple-monkey-dinosaur", hashedPassword); // returns true
// bcrypt.compareSync("pink-donkey-minotaur", hashedPassword);
const urlDatabase = {
  "b2xVn2": {
    url: "http://www.lighthouselabs.ca",
    userID: "userRandomID"
  },
  "9sm5xK": {
    url: "http://www.google.com",
    userID: "user2RandomID"
  }
};

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: bcrypt.hashSync("purple-monkey-dinosaur", 10)
  },
 "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: bcrypt.hashSync("dishwasher-funk", 10)
  }
}

function validateLogin(email, password) {
  for (user in users) {
    if (users[user].email === email && bcrypt.compareSync(password, users[user].password)) {
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

function filteredUrls (userID) {
  let filterObj = {};
  for (var shortUrl in urlDatabase) {
    console.log(shortUrl);
    if (userID === urlDatabase[shortUrl].userID) {
      filterObj[shortUrl] = urlDatabase[shortUrl];
    }
  }
  return filterObj;
}

app.get('/register', (req, res) => {
  let templateVars = {
    urls: urlDatabase,
    userID: req.cookies['userID'],
    pageID: 'reg'
  };

  res.render('register', templateVars);
});

app.post('/register', (req, res) => {
  if (!req.body.email || !req.body.password) {
    res.sendStatus(400);
  } else {

    const password = req.body.password;
    const hashedPassword = bcrypt.hashSync(password, 10);


    let randomID = generateRandomString();
    users[randomID] = {
      id: randomID,
      email: req.body.email,
      password: hashedPassword
    };
    res.cookie('userID', randomID);
    res.redirect('/urls');
  }
});

app.get('/login', (req, res) => {
  let templateVars = {
    urls: urlDatabase,
    userID: req.cookies['userID'],
    pageID: 'login'
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
    urls: filteredUrls(req.cookies['userID']),
    userID: req.cookies['userID'],
    pageID: '',

  };


  res.render('urls_index', templateVars);
});

app.get('/urls/new', (req, res) => {
  let templateVars = {
    urls: urlDatabase,
    userID: req.cookies['userID'],
    pageID: ''
  };

  res.render('urls_new', templateVars);
});

app.get("/urls/:shortUrl", (req, res) => {
let shortUrl = req.params.shortUrl
  let templateVars = {
    shortUrl: req.params.shortUrl,
    // urls: urlDatabase[req.params.id],
    urls: filteredUrls(req.cookies['userID']),
    userID: req.cookies['userID'],
    pageID: ''
  };
  if (req.cookies['userID'] !== urlDatabase[shortUrl].userID) {
    res.status(401).send('You cannot edit this URL');
  } else {
    res.render("urls_show", templateVars);
  }

});

app.post('/urls', (req, res) => {
  let urlId = generateRandomString();
  urlDatabase[urlId] = req.body.longURL;
  res.redirect('/urls/'+urlId);
});

app.get('/u/:shortUrl', (req, res) => {
  let shortUrl = req.params.shortUrl
  let longURL = urlDatabase[shortUrl].url;
  res.redirect(longURL);
});

app.post('/urls/:id', (req, res) => {
  // urlDatabase[req.params.id] = req.body.longURL
  let templateVars = {
    id: req.params.id,
    urls: filteredUrls(req.cookies['userID']),
    userID: req.cookies['userID']

  };

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
    userID: req.cookies['userID'],
    pageID: ''
  };

  res.redirect('/urls/', templateVars);
});

app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
