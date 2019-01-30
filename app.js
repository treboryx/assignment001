
// *********************************************
/*                  PRE CONFIG                */

var express             = require('express');
var bodyParser          = require('body-parser');
var expressValidator    = require('express-validator');
var mysql               = require('mysql');
var path                = require('path');
var app                 = express();
var passport            = require('passport');
var GitHubStrategy      = require('passport-github').Strategy;
var fetch               = require('node-fetch');
var config              = require('./config.json');




// *********************************************
/*                 GitHub Passport            */

passport.use(new GitHubStrategy({
  clientID: config.github_clientId,
  clientSecret: config.github_clientSecret,
  callbackURL: config.github_callback
},
function(accessToken, refreshToken, profile, cb){
  return cb(null, profile);
}
));

passport.serializeUser(function(user, cb){
  cb(null, user);
});
  
passport.deserializeUser(function(obj, cb){
  cb(null, obj);
});

// *********************************************
/*                  APP CONFIG                */

app.set('port',       config.port);
app.set('view engine',      'ejs');

// *********************************************
/*                  DB CONFIG                 */

var connection = mysql.createConnection(
  {
    host     : config.db_host,
    user     : config.db_username,
    password : config.db_password,
    database : config.db_name
  });

connection.connect();

// *********************************************
/*                  MIDDLEWARE                */

//Middleware should fire before any ROUTING

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

// Set static path: CSS, Jquery etc (Angular, React would go here as index overrides routing)
app.use(express.static(path.join(__dirname, 'public')));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

//express validator middleware

app.use(require('morgan')('combined'));
app.use(require('cookie-parser')());
app.use(require('express-session')(
  {
    secret: 'keyboard cat', // needs to be generated and hashed
    resave: true,
    saveUninitialized: true,
    cookie: { maxAge: 600000000 }
  }));

app.use(expressValidator());
app.use(passport.initialize());
app.use(passport.session());


// *********************************************
/*                  GLOBAL VARS               */

app.use(function(req, res, next)
{
  res.locals.errors = null;
  next();
});

// *********************************************
/*                     ROUTING                */


app.get('/', function(req, res)
{
  res.render('index',
    {
      title   :   'Please Login!'
    });
});


app.get('/auth/github',
  passport.authenticate('github'));


app.get('/auth/github/callback', 
  passport.authenticate('github', { failureRedirect: '/auth/github' }),
  function(req, res){
    // Successful authentication, redirect home.
    res.redirect('/profile');
  });


app.get('/profile',
  require('connect-ensure-login').ensureLoggedIn('/auth/github'),
  
  async function(req, res){
    const count = [];
    await fetch(`https://api.github.com/users/${req.user.username}/starred`, { method: 'GET',  headers: { 'Accept': 'application/json'} })
      .then(res => res.json()) // expecting a json response
      .then(json => { 
        json.forEach(e => {
          count.push(e.full_name);
        });
      });
    connection.query('SELECT * FROM starredrepositories', function(error, results, fields)
    {
      res.render('profile', { user: req.user, starCount: count.length, repos: results });
    });
  });


app.post('/fetch', async function(req, res)
{
  await fetch(`https://api.github.com/users/${req.user.username}/starred`)
    .then(res => res.json()) // expecting a json response
    .then(json => { 
      json.forEach(e => {

        connection.query('SELECT id FROM starredrepositories WHERE id = ?', e.id, function(error, results, fields)
        {
          if (results.length)
          {
            return console.log(`${e.full_name} already exists in the MySQL database.`);
          } else {
            connection.query('INSERT INTO starredrepositories (id, name, owner, link, stars) VALUES (?, ?, ?, ?, ?)', [e.id, e.name, e.owner.login, e.html_url, e.stargazers_count], function(error, results, fields)
            {
              if (error) { console.log(error); } else
              {
                console.log(`${e.full_name} added to the MySQL database.`);
              }
            });
          }
        });
      });
    });
  res.redirect('/profile');
});

// *********************************************
/*                  APP LAUNCH                */

app.listen(app.get('port'), function()
{
  console.log('app live at localhost:' + app.get('port'));
});
