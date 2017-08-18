const mongoose = require('mongoose')
      Schema = mongoose.Schema;
      Bar = mongoose.model('Bar', new Schema({
          _id:  String,
          going_count: String
      }));

module.exports = Bar