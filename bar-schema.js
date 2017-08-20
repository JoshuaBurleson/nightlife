const mongoose = require('mongoose')
      Schema = mongoose.Schema;
      Bar = mongoose.model('Bar', new Schema({
          _id:  String,
          name: String,
          going_count: String,
          users_going: Array
      }));

module.exports = Bar