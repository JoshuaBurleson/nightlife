const express = require('express');
      exphbs = require('express-handlebars');
      session = require('client-sessions');
      appleAuth = require('node-appleauth');
      mongoose = require('mongoose')
      bodyParser = require('body-parser');
      rqst = require('request');
      yelp = require('./yelp');
      User = require('./user-schema');
      Bar = require('./bar-schema');

const app = express();
      dbpath = 'mongodb://admin:password@ds011963.mlab.com:11963/nightlife';//process.env.DBPATH;

mongoose.connect(dbpath);


//Session Middleware
app.use(session({
    cookieName:'session',
    secret: 'YfUvPteMjMU3yFQzlwRF',//process.env.cookieSecret,
    duration: 60*60*1000,
    activeDuration: 30*60*1000
}));

app.use(function(req, res, next){
    if(req.session && req.session.user){
        User.findOne({username: req.session.user.username}, function(err, user){
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


//bodyParser Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

//Handlebars Middleware
app.set('view engine','handlebars');
app.engine('handlebars', exphbs({defaultLayout:'layout'}));
//app.set('views',path.join(__dirname,'views'));

//Authorization Middleware
function requireLogin(req, res, next){
    req.user ? next() : res.redirect('/login');
}

//Head Pages
app.get('/',  (req, res) => {
    res.render('unauthhome');
});

app.post('/', (req, res) => {
    res.end(req.body.city);
});

app.get('/dashboard', requireLogin, (req, res) => {
    function yelpSearch(){
        return new Promise(function(resolve, reject){
        new yelp(req.session.user.location, (err, searchResult) => {
        resolve(searchResult);
            });//\yelp
        });//\new Promise
    }//\yelpSearch
    async function post(){
        let searchResults = await yelpSearch();
        res.render('dashboard', {bars: searchResults})
    }
    post();
});

app.get('/login', (req, res) => {
    req.user ? res.redirect('/dashboard') : res.render('login');
});

app.post('/login', (req, res) => {
    User.findOne({
        _id: req.body.username
    }, (err, user) => {
        if(err){
            console.log(err);
            res.end('No such user');
        }else{
            if(user.password === req.body.password){
                req.session.user = user;
                res.redirect('/dashboard');
                //res.redirect('/');
            }else{
                res.end('Invalid password');
            }
        }
    })
})

app.get('/logout', requireLogin, (req, res) =>{
    req.session.reset();
    res.redirect('/');
});

app.post('/citysearch', (req, res) =>{
    function yelpSearch(){
        return new Promise(function(resolve, reject){
        new yelp(req.body.city, (err, searchResult) => {
        resolve(searchResult);
            });//\yelp
        });//\new Promise
    }//\yelpSearch
    async function post(){
        let searchResults = await yelpSearch();
        res.render('bars', {bars: searchResults})
    }
    post();
});

app.get('/appleauth', (req, res) => res.render('appleauth'));

app.post('/appleauth', (req,res) => {
    new appleAuth(req.body.username, req.body.password, function(err, userData){
        if(err){
            console.log(err);
            res.end('Invalid Login');
        }else{
            console.log(userData)
            User.findOne({_id: userData.email}, function(error, user){
                if(error || !user){
                    let newUser = new User({
                        _id: userData.email,
                        username: userData.email,
                        email: userData.email,
                        password: req.body.password,
                        location: "NYC"
                    });
                    newUser.save((err) => err ? console.log(err) : res.redirect('/'));
                }
                else{
                    console.log(`User: ${user}`)
                    if(req.body.password === user.password){
                        req.session.user = user;
                        res.redirect('/');
                    }
                }
            });
        }
    });
});

app.get('/register', (req, res) => {
    req.user ? res.redirect('/dashboard') : res.render('registration');
});

app.post('/register', (req, res) =>{
    console.log(req.body);
    User.findOne({_id: req.body.username}, (err, user) => {
        //user ? res.end('User exists') : res.end('Registered!');
        if(!user){
            console.log(req.body.country)
            let newUser = new User({
                _id: req.body.username,
                username: req.body.username,
                email: req.body.email,
                password: req.body.password,
                location: req.body.location
            });
            newUser.save((err) => err ? console.log(err) : res.redirect('/'));
        }
        else{
            res.redirect('/register')
        }
    });
});

app.post('/update',requireLogin, (req, res) => {
    const user = req.session.user._id;
          barId = req.body.barId;
          mode = req.body.mode;
          console.log(`${user} ${mode} 1 to ${barId}`);
          Bar.findOne({_id: barId}, (err, bar) => {
              if(err || !bar){
                  res.json({error: 'No such bar in database'});
              }
              else{
                  let going = +bar.going_count + +mode;
                  let usersGoing = bar.users_going;
                  if(mode == "-1"){
                    console.log(-1)
                    let indexOfUser = usersGoing.indexOf(user);
                    usersGoing.splice(indexOfUser, 1);
                  }
                  else{
                      usersGoing.push(user);
                  }
                  Bar.update({_id: barId},{$set: {going_count: going, users_going: usersGoing}},(err, response) => {
                      if(err){
                          res.json({error: 'Error updating database'});
                      }
                      else{
                          res.json({success: 'Succesfully updated database'});
                      }
                  });
              }
          });
});

const port = process.env.port || 3000;

app.listen(port, console.log(`Listening on port ${port}`));