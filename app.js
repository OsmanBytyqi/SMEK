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

require('dotenv/config');
mongoose.connect(process.env.CONN_STRING, { useNewUrlParser: true, useUnifiedTopology: true })
  .then((result) => console.log("now you are connected with mangodb"))
  .catch((err) => console.log(err));
mongoose.set('useFindAndModify', false);



app.use(require("express-session") ({
    secret : "Wubba lubba dub dub",
    saveUninitialized : false,
    resave : false
}));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());

passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
   res.locals.currentUser   = req.user;
   res.locals.error         = req.flash("error");
   res.locals.success       = req.flash("success");
   res.locals.warning       = req.flash("warning");
   next();
});



app.use(userRoutes);
app.use(adminRoutes);
app.use(scheduleRoutes);
app.use(authRoutes);

// const https = require("https").createServer(
//   {
//     key: fs.readFileSync("key.pem"),
//     cert: fs.readFileSync("cert.pem"),
//   },
//   app
// );
// server = https.listen(process.env.PORT || 3000, () => {
//   console.log("your server is running at https://localhost:3000");
// });


server =app.listen(process.env.PORT || 3000, () => {
  console.log("your server is running at http://localhost:3000");
});



const io = require("socket.io")(server);

let users = [];
let connnections = [];


io.on('connection', (socket) => {
    console.log('New user connected');
    connnections.push(socket)

    let color = randomColor();

    socket.color = color;

    socket.on('change_username', data => {

        socket.username = data.nickName;
        users.push({ username: socket.username,color: socket.color});
        updateUsernames();
    })

    const updateUsernames = () => {
        io.sockets.emit('get users',users)
    }

    socket.on('new_message', (data) => {
        io.sockets.emit('new_message', {message : data.message, username : socket.username, color: socket.color});
    })

    socket.on('typing', data => {
        socket.broadcast.emit('typing',{username: socket.username,color: socket.color})
    })

    socket.on('disconnect', data => {

        if(!socket.username)
            return;
        let user = undefined;
        for(let i= 0;i<users.length;i++){
            if(users[i].id === socket.id){
                user = users[i];
                break;
            }
        }
        users = users.filter( x => x !== user);
        updateUsernames();
        connnections.splice(connnections.indexOf(socket),1);
    })
})
