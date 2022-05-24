const express = require("express"),
 app = express(),
 bodyParser = require("body-parser"),
 mongoose = require("mongoose"),
 passport = require("passport"),
 randomColor = require('randomcolor')
 sanitizer = require("express-sanitizer"),
 methodOverride = require("method-override"),
 localStrategy = require("passport-local"),
 fs = require("fs"),
 flash = require("connect-flash"),
 User = require("./models/user"),
 Activity = require("./models/activity"),
 Issue = require("./models/issue"),
 userRoutes = require("./routes/users"),
 adminRoutes = require("./routes/admin"),
 scheduleRoutes = require("./routes/schedules"),
 authRoutes = require("./routes/auth"),
 middleware = require("./middleware"),


app.set("view engine", "ejs");
app.use(methodOverride("_method"));

app.use(express.static(__dirname + "/public"));
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended : true}));
app.use(sanitizer());


const url =  "mongodb+srv://osmani:osmani@second-project.u8ncf.mongodb.net/ssh-project?retryWrites=true&w=majority";

mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true })
  .then((result) => console.log("now you are connected with mangodb"))
  .catch((err) => console.log(err));
// mongoose.connect(url, {useNewUrlParser : true, useUnifiedTopology: true,});
