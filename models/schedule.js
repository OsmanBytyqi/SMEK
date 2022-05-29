const mongoose = require("mongoose");

const scheduleSchema = new mongoose.Schema({
   title : String,
   ditaejaves : String,
   telira: Number,
   author : String,
   description : String,
   category : String

     });

module.exports =  mongoose.model("Schedule", scheduleSchema);
