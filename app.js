
require('dotenv').config()
const express = require('express')
const mongoose = require('mongoose');
const ejs = require('ejs');
const bodyparser = require('body-parser');
const session = require('express-session');
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require("passport-facebook")
const findOrCreate = require('mongoose-findorcreate')



const app = express()
app.set('view engine', 'ejs');
app.use(bodyparser.urlencoded({ extended: true }));
app.use(express.static('public'))

app.use(session({
    secret: "this is the long text.",
    resave: false,
    saveUninitialized: true
}));

app.use(passport.initialize());
app.use(passport.session());





mongoose.connect('mongodb://127.0.0.1:27017/userDB');

const userSchema = new mongoose.Schema({
    email: String,
    password: String,
    googleId: String
})

userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);

const User = new mongoose.model("User", userSchema)
passport.use(User.createStrategy());

///////////////serialize and  deserialze ////////////////////
passport.serializeUser(function (user, cb) {
    process.nextTick(function () {
        return cb(null, {
            id: user.id,
            username: user.username,
            picture: user.picture
        });
    });
});

passport.deserializeUser(function (user, cb) {
    process.nextTick(function () {
        return cb(null, user);
    });
});



/////////////////google strategy//////////////////////////
passport.use(new GoogleStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/google/secrets",
    scope: ['profile'],
    state: true
},
    function (accessToken, refreshToken, profile, cb) {
        console.log(profile)
        User.findOrCreate({ googleId: profile.id }, function (err, user) {
            return cb(err, user);
        });
    }
));


// ///////////////face book strategy//////////

// passport.use(new FacebookStrategy({
//     clientID: FACEBOOK_APP_ID,
//     clientSecret: FACEBOOK_APP_SECRET,
//     callbackURL: "http://localhost:3000/auth/facebook/secrets"
//   },
//   function(accessToken, refreshToken, profile, cb) {
//     User.findOrCreate({ facebookId: profile.id }, function (err, user) {
//       return cb(err, user);
//     });
//   }
// ));




app.get("/", function (req, res) {
    res.render("home");
});

app.get('/auth/google',
    passport.authenticate('google', { scope: ['profile'] }));

app.get("/auth/google/secrets",
    passport.authenticate("google", { failureRedirect: '/login' }),
    function (req, res) {
        // Successful authentication, redirect home.
        res.redirect('/secrets');
    });


//  app.get('/auth/facebook',
//   passport.authenticate('facebook', { scope: ['user_friends', 'manage_pages'] }));

// app.get('/auth/facebook/secrets',
//   passport.authenticate('facebook', { failureRedirect: '/login' }),
//   function(req, res) {
//     // Successful authentication, redirect home.
//     res.redirect('/secrets');
//   });

app.get("/login", function (req, res) {
    res.render("login");
})

app.get("/register", function (req, res) {
    res.render("register");
})

app.get("/secrets", function (req, res) {
    if (req.isAuthenticated()) {
        res.render("secrets")
    } else {
        res.redirect("/login")
    }
});

app.get("/logout", function (req, res) {
    req.logout(function (err) {
        if (err) {
            console.log(err)
        } else {
            res.redirect("/");
        }
    })

})

app.post("/register", function (req, res) {
    User.register({ username: req.body.username }, req.body.password, function (err, user) {
        if (err) {
            console.log(err)
            res.redirect("/register");
        } else {
            passport.authenticate("local")(req, res, function () {
                res.redirect("/secrets")
            })
        }
    })

});

app.post("/login", function (req, res) {

    const user = new User({
        username: req.body.username,
        password: req.body.password
    });

    req.login(user, function (err) {
        if (err) {
            console.log(err)
            res.send("somting went Wrong!")
        } else {
            passport.authenticate("local")(req, res, function () {
                res.redirect("/secrets")
            })
        }
    })

});






app.listen(3000, function (req, res) {
    console.log('app started in port 3000');
});
