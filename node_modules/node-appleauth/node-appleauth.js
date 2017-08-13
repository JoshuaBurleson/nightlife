const request = require('request');

class AppleAuth{
    constructor(username, password, callback, options) {
        this.username = username;
        this.password = password;

        if (!this.username || !this.password){
            callback(new Error("Username & Password are required."));
        }

        this.req = request.defaults({
            headers: {"Origin": "https://www.icloud.com"}
        });
        
        this.login(callback);
    };

    login(callback){
        const options = {
            method: "POST",
            url: "https://setup.icloud.com/setup/ws/1/login", 
            json: {
            "apple_id": this.username,
            "password": this.password,
            "extended_login": true
            }
        };

        this.req(options, function(err, res, userData) {
            if (err) {
            return callback(err);
            }
                if (!res || res.statusCode !== 200) {
            const errRoster = {1: "LoginError: Invalid Credentials", 7: "LoginError: Username must be email address."}
            let errorMessage = errRoster[body.error];
                    return callback(new Error(errorMessage));
                }
            this.userStatus = {
            name: userData.dsInfo.fullName,
            email: userData.dsInfo.appleId
            }
            return callback(null, this.userStatus);
        });
    };
}

module.exports = AppleAuth;