const express = require ('express')
const mongoose = require('mongoose');
const ejs = require ('ejs');
const bodyparser = require ('body-parser');
const encrypt = require('mongoose-encryption');

const app = express() 
app.set ('view engine', 'ejs' );
app.use (bodyparser.urlencoded({extended : true}));
app.use(express.static('public'))
mongoose.connect('mongodb://127.0.0.1:27017/userDB');

const userSchema = new mongoose.Schema({
    email : String,
    password : String
})

// const encKey = crypto.randomBytes(32).toString('base64');

// // Generate a random 32-byte signing key
// const sigKey = crypto.randomBytes(32).toString('base64');

secret = "set it to any string you want"

userSchema.plugin(encrypt, { secret: secret ,encryptedFields: ["password"] });

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
        password : req.body.password
    })
    newUser.save().then(function(){
        res.render("secrets")
    }).catch(function(err){
        console.log(err)
    })
});

app.post("/login", function(req, res){
    const username  =req.body.username;
    const password = req.body.password;
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