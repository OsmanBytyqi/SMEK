const mongoose = require("mongoose");

const issueSchema = new mongoose.Schema({
   schedule_info : {
       id : {
           type : mongoose.Schema.Types.ObjectId,
           ref : 'Schedule',
       },
       title : String,
       author : String,
        ditaejaves: String,
       category : String,
       telira: Number,
       issueDate : {type : Date, default : Date.now()},
       returnDate : {type : Date, default : Date.now() + 7*24*60*60*1000}
   },

   user_id : {
       id : {
           type : mongoose.Schema.Types.ObjectId,
           ref : 'User',
       },

       username : String,
   },
});


module.exports = mongoose.model("Rezervo", issueSchema);
