const yelp = require("yelp-fusion");
      yelpCID = "LagThei7Au173W3zOCMsrA" //process.env.yelpCID 
      yelpSecret = "8jI6yDfpUj3o74uyzm3Wllth5bR0czoAJwDxe1dDgSwbXrnUsgoJek0t42lVSeOL"//process.env.yelpSECRET
      mongoose = require('mongoose');
      Bar = require('./bar-schema');
      dbpath = 'mongodb://admin:password@ds011963.mlab.com:11963/nightlife';//process.env.DBPATH;

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
                                if(err){console.log(err)}
                                //bars.push({_id: barId, going_count: 0})
                                //console.log(bars.length);
                            });
                            bars.push({_id: yelpBar.id, name: yelpBar.name, going_count: 0})
                            //console.log(bars.length);
                        }
                        else{
                            //console.log(`returning bar`)
                            //console.log(`${bars.length}/${searchResults.length-1}`);
                            bars.push(bar);
                        }
                    if(crossCheck(searchResults, bars)){
                        callback(null, bars);
                    }else{
                        //console.log(`Nope 1: ${bars}
                          //                   ${bars.length} / ${searchResults.length-1}`)
                    }
                    });
                });
                //callback(null, searchResults);
            }).catch(searchErr => callback(searchErr, null));
        }).catch(err => console.log(err));
    }
}

module.exports = XretrieveYelpData