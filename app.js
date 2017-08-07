const express = require('express');
      exphbs = require('express-handlebars');
      session = require('client-sessions');
      mongo = require('mongodb');

const app = express();
      dbpath = process.env.DBPATH;
      Users = dbpath.collection('users');

//Session Middleware
app.use(session({
    cookieName:'session',
    secret: process.env.cookieSecret,
    duration: 60*60*1000,
    activeDuration: 30*60*1000
}));

app.use(function(req, res, next){
    if(req.session && req.session.user){
        Users.findOne({username: req.session.user.username}, function(err, user){
            if(user){
                req.user = user;
                delete req.user.password;
                req.session.user = user;
                res.locals.user = user;
            }
            next();
        })
    }else{
        next();
    }
});

app.set('view engine','handlebars');
app.engine('handlebars', exphbs({defaultLayout:'layout'}));
app.set('views',path.join(__dirname,'views'));


function requireLogin(req, res, next){
    req.user ? next() : res.redirect('/login');
}

app.get('/',  (req, res) => {
    req.session ? res.redirect('/dashboard') : res.render('login');
});

app.get('/dashboard', (req, res) => {
    req.session.user ? res.render('dashboard') : res.redirect('login');
})