const mongoose = require('mongoose') 
      Schema = mongoose.Schema;
      User = mongoose.model('User', new Schema({
          _id:  String,
          username: String,
          email: String,
          password: String,
          location: Array
      }));

module.exports = User