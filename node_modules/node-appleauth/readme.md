# Node AppleAuth
Node AppleAuth is a lightweight, easy to use, novelty utilization of iCloud's login API for simple user authentication.

#### Installation
`npm install node-appleauth --save`

`const appleAuth = require('node-appleauth')`

#### Usage
Calling a new appleAuth object takes three arguments (username, password, callback) and will return a user data object in the following format to the callback:
`{"name":"Elliot Alderson","email":"elliot.alderson@allsafe.com"}`
###### With Await/Async
```javascript
const express = require('express');
      appleAuth = require('node-appleauth');
      bodyParser = require('body-parser');
      //Some templating engine, session module, and database probably should go here
      app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));

//Some of your favorite middleware goes here

function iAuth(username, password){
    let userData;
    return new Promise(function(resolve, reject){
        new appleAuth(username, password, function(err, response){
            if(err){
                userData = err;
            }
            else{
                userData = response;
            }
            resolve(userData);
        });
    });
}

app.get('/', (req, res) => {res.render('login')});

app.post('/', (req, res) => {
    async function checkAuth(username, password){
        let userData = await iAuth(username, password);
        //Save the user to a database, retrieve the user from a database, start a session, redirect, or do whatver you want from here.
        res.end(JSON.stringify(userData)); //or be lazy and just display the data.
    }
    checkAuth(req.body.username, req.body.password);
});

const port = 3000 || process.env.port;
app.listen(port, function(){console.log(`Listening on port: ${port}`)});
```

###### Without Await/Async
```javascript
const express = require('express');
      appleAuth = require('node-appleauth');
      bodyParser = require('body-parser');
      //Some templating engine, session module, and database probably should go here
      app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));

//Some of your favorite middleware goes here

app.get('/', (req, res) => {res.render('login')});

app.post('/', (req, res) => {
    new appleAuth(req.body.username, req.body.password, function(err, data){
        if(err){
            console.log('error');
            res.end(String(err));
        }else{
            res.end(JSON.stringify(data));
        }
    });
});
```