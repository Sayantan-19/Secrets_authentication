
require('dotenv').config()
const express = require ('express')
const mongoose = require('mongoose');
const ejs = require ('ejs');
const bodyparser = require ('body-parser');
const session = require('express-session');
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");



const app = express() 
app.set ('view engine', 'ejs' );
app.use (bodyparser.urlencoded({extended : true}));
app.use(express.static('public'))

app.use(session({
    secret: "this is the long text.",
    resave: false,
    saveUninitialized: true
}))

app.use(passport.initialize());
app.use(passport.session());





mongoose.connect('mongodb://127.0.0.1:27017/userDB');

const userSchema = new mongoose.Schema({
    email : String,
    password : String
})

userSchema.plugin(passportLocalMongoose)


const User  = new mongoose.model("User", userSchema)
passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.get("/", function(req, res){
    res.render("home");
})

app.get("/login", function(req, res){
    res.render("login");
})

app.get("/register", function(req, res){
    res.render("register");
})

app.get("/secrets", function(req, res){
    if(req.isAuthenticated()){
        res.render("secrets")
    }else{
        res.redirect("/login")
    }
});

app.get("/logout", function (req, res) {
    req.logout(function(err){
        if(err){
            console.log(err)
        }else{
            res.redirect("/");
        }
    })
    
})

app.post("/register", function(req,res){
User.register({username: req.body.username}, req.body.password, function(err, user){
    if(err){
        console.log(err)
        res.redirect("/register");
    }else{
        passport.authenticate("local")(req, res, function(){
            res.redirect("/secrets")
        })
    }
})

});

app.post("/login", function(req, res){

    const user = new User({
        username: req.body.username,
        password: req.body.password
    });

    req.login(user,function(err){
        if(err){
            console.log(err)
            res.send("somting went Wrong!")
        }else{
            passport.authenticate("local")(req, res, function(){
                res.redirect("/secrets")
            })
        }
    })

});






app.listen(3000, function(req, res){
console.log('app started in port 3000');
});
