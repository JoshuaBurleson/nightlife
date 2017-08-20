const yelp = require("yelp-fusion");
      yelpCID = process.env.YELPCID 
      yelpSecret = process.env.YELPSECRET
      mongoose = require('mongoose');
      Bar = require('./bar-schema');
      dbpath = process.env.DBPATH;

mongoose.connect(dbpath);

function crossCheck(newArray, oldArray){
    if(newArray.length == oldArray.length){
        return true;
    }
}


class XretrieveYelpData{
    constructor(location, callback){
        yelp.accessToken(yelpCID, yelpSecret).then(tokenData => {
            let yelpClient = yelp.client(tokenData.jsonBody.access_token);
            yelpClient.search({
                term: "Bar",
                location: location
            }).then(searchResult => {
                let searchResults = searchResult.jsonBody.businesses.map(
                    (bar) => { return {id: bar.id, name: bar.name}}
                );
                let bars = [];
                searchResults.forEach(yelpBar =>{
                    Bar.findOne({_id: yelpBar.id}, (err, bar) => {
                        if(err || !bar){
                            console.log('Creating New ');
                            let newBar = new Bar({
                                _id: yelpBar.id,
                                name: yelpBar.name,
                                going_count: 0
                            });
                            newBar.save((err) => {
                                if(err){console.log(err);}
                            });
                            bars.push({_id: yelpBar.id, name: yelpBar.name, going_count: 0});
                        }
                        else{
                            bars.push(bar)
                        }
                    if(crossCheck(searchResults, bars)){
                        callback(null, bars);
                    }});
            })
            }).catch(searchErr => callback(searchErr, null));
        }).catch(err => console.log(err));
    }
}

module.exports = XretrieveYelpData