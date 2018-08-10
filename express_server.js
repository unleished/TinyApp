const cookieSession = require('cookie-session')
const express = require('express');
const app = express();

app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2'],

  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}))

const bcrypt = require('bcrypt');

const PORT = process.env.PORT || 8080;

app.set('view engine', 'ejs');

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));


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
      // return users[user].id;
      return true;
    }
  }
  return false;
}

// function generates a randome string for user[users], user[users].id, & urlDatabase[shortUrl] values.
function generateRandomString() {
  let randomChar = '';
  let randomString = 'KikidoyoulovemeAreyouridingSayyoullnevereverleavefrombesidemeCauseiwantyaandineedya0123456789';
    for (let i = 0; i < 6; i++) {
      randomChar += randomString[Math.floor(Math.random() * 93)]
    }
  return randomChar;
}

// filters through the urlDatabase to find urls related to a specific userID.
function filteredUrls (userID) {
  let filterObj = {};
  for (var shortUrl in urlDatabase) {
    if (userID === urlDatabase[shortUrl].userID) {
      filterObj[shortUrl] = urlDatabase[shortUrl];
    }
  }
  return filterObj;
}
// Take a userID and find the email for the user.
function userEmail(userID) {
  let emailObj = {};
  for (var user in users) {
    if (userID === users[user].id) {
      emailObj = users[user]
    }
  }
  return emailObj.email;
};

function emailExists(email) {
  let existEmailObj = {};
  for (var userEmail in users) {
    if (userEmail === users[userEmail]) {
      var result = true;
    } else {
      return false;
    }
  }
  return result;
}

app.get('/register', (req, res) => {
  let templateVars = {
    urls: urlDatabase,
    userID: req.session.userID,
    pageID: 'reg',
    email: userEmail(req.session.userID)
  };

  res.render('register', templateVars);
});

app.post('/register', (req, res) => {
  if (!req.body.email || !req.body.password) {
    res.sendStatus(400);
  } else if (!emailExists(req.body.email)) {
    res.sendStatus(409);
  } else {

    const password = req.body.password;
    const hashedPassword = bcrypt.hashSync(password, 10);

    let randomID = generateRandomString();
    users[randomID] = {
      id: randomID,
      email: req.body.email,
      password: hashedPassword
    };

    req.session.userID = randomID;
    res.redirect('/urls');
  }
});

app.get('/login', (req, res) => {
  let templateVars = {
    urls: urlDatabase,
    users: users,
    userID: req.session.userID,
    pageID: 'login',
    email: userEmail(req.session.userID)
  };

  res.render('login', templateVars);
});

app.post('/login', (req, res) => {
  if (validateLogin(req.body.email, req.body.password)) {
    let userID = users[user].id;
    req.session.userID = userID;
    let templateVars = {
      urls: urlDatabase,
      userID: req.session.userID,
      pageID: '',
      email: userEmail(req.session.userID)
    };
    res.redirect('/urls');
  } else {
    res.status(403).send('Please check your login credentials')
  }
});


app.get('/urls', (req, res) => {
  let templateVars = {
    urls: filteredUrls(req.session.userID),
    userID: req.session.userID,
    pageID: '',
    email: userEmail(req.session.userID)
  };
  if (templateVars.userID) {
    res.render('urls_index', templateVars);
  } else {
    res.sendStatus(403);
  }
});



app.get('/urls/new', (req, res) => {
  let templateVars = {
    urls: urlDatabase,
    userID: req.session.userID,
    pageID: '',
    email: userEmail(req.session.userID)
  };

  if (templateVars.userID) {
    res.render('urls_new', templateVars);
  } else {
    res.redirect('/login');
  }

});

app.get('/urls/:shortUrl', (req, res) => {
let shortUrlID = req.params.shortUrl
  let templateVars = {
    shortUrl: req.params.shortUrl,
    longUrl: urlDatabase[req.params.shortUrl].url,
    urls: urlDatabase[req.params.shortUrl].url,
    // // urls: filteredUrls(req.session.userID),
    userID: req.session.userID,
    pageID: '',
    email: userEmail(req.session.userID)
  };

  if (req.session.userID !== urlDatabase[shortUrlID].userID) {
    res.status(401).send('You cannot edit this URL');
  } else {
    res.render("urls_show", templateVars);
  }
});

app.post('/urls', (req, res) => {
  let urlId = generateRandomString();
  urlDatabase[urlId] = {
    url: req.body.longURL,
    userID: req.session.userID
  };


  res.redirect('/urls/'+urlId);
});

app.get('/u/:shortUrl', (req, res) => {
  let shortUrl = req.params.shortUrl
  let longURL = urlDatabase[shortUrl].url;
  res.redirect(longURL);

});

app.post('/urls/:shortUrl', (req, res) => {
  urlDatabase[req.params.shortUrl].url = req.body.longURL

  res.redirect('/urls/');
});
// +req.params.shortUrl

app.post('/urls/:id/delete', (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect('/urls/');
});

app.get('/hello', (req, res) => {
  res.end('<html><body>Hello <b>World</b></body></html>\n');
});

app.post('/logout', (req, res) => {
  req.session.userID = null;
  res.redirect('/login');
});

app.get('/', (req, res) => {
  let templateVars = {
    urls: urlDatabase,
    userID: req.session.userID,
    pageID: '',
    email: userEmail(req.session.userID)
  };
  if (templateVars.userID) {
    res.redirect('/urls/');
  } else {
    res.redirect('/login')
  }
});

app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
