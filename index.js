const express = require('express');
const session = require('express-session');
const app = express();
const path = require('path');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth2').Strategy;
require('dotenv').config();


// Configuration
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

// Middlewares
app.use(express.static(__dirname+'/static'));
app.use(session({secret: 'cats'}));
app.use(passport.initialize());
app.use(passport.session());

function isLoggedIn(req, res, next) {
  req.user ? next() : res.sendStatus(401);
}

// Passport
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
passport.use(new GoogleStrategy({
  clientID: GOOGLE_CLIENT_ID,
  clientSecret: GOOGLE_CLIENT_SECRET,
  callbackURL: "https://oauth2-test-nine.vercel.app/google/callback",
  passReqToCallback: true
  },
  function(request, accessToken, refreshToken, profile, done) {
    console.log(profile);
    return done(null, profile);
  }
));

// Endpoints
app.get('/', (req, res) => {
  res.render(path.join(__dirname+'/html/index.html'));
});

app.get('/success', isLoggedIn, (req, res) => {
  res.render(path.join(__dirname+'/html/success.html'), {user: req.user});
});

app.get('/auth/failure', (req, res) => {
  res.send('Failed to authenticate');
});

app.get('/logout', (req, res, next) => {
  req.logout(function(err) {
    if (err) {
      return next(err);
    }
    res.redirect('/');
  });
});

app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

app.get('/google/callback', passport.authenticate('google', {
  successRedirect: '/success', 
  failureRedirect: '/auth/failure'
}))

app.listen(5001, () => {
  console.log('Listening on port 5001');
});

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(user, done) {
  done(null, user);
});