
require('dotenv').config()
const express = require ('express')
const mongoose = require('mongoose');
const ejs = require ('ejs');
const bodyparser = require ('body-parser');
const md5 = require("md5")
const app = express() 
app.set ('view engine', 'ejs' );
app.use (bodyparser.urlencoded({extended : true}));
app.use(express.static('public'))
mongoose.connect('mongodb://127.0.0.1:27017/userDB');

const userSchema = new mongoose.Schema({
    email : String,
    password : String
})


const User  = new mongoose.model("User", userSchema)

app.get("/", function(req, res){
    res.render("home");
})

app.get("/login", function(req, res){
    res.render("login");
})

app.get("/register", function(req, res){
    res.render("register");
})

app.post("/register", function(req,res){
    const newUser = new User({
        email : req.body.username,
        password : md5(req.body.password)
    })
    newUser.save().then(function(){
        res.render("secrets")
    }).catch(function(err){
        console.log(err)
    })
});

app.post("/login", function(req, res){
    const username  =req.body.username;
    const password = md5(req.body.password)
    User.findOne({email : username}).then(function(founduser){
        if (founduser){
            if(founduser.password === password){
                res.render("secrets")
            }else{
                res.send("unvalid password")
            }
            
        }else(
            res.send("user not found")
        )
    }).catch(function(err){
        console.log(err)
    })
})




app.listen(3000, function(req, res){
console.log('app started in port 3000');
});
