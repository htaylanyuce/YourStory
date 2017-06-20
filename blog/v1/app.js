var mongoose = require("mongoose");
var express = require("express");
var app = express();
var bodyParser = require("body-parser");
var FacebookStrategy  =     require('passport-facebook').Strategy;
var config            =     require('./config/auth');
var passport = require("passport");
var LocalStrategy = require("passport-local");
var Stories = require("./models/stories");
var User = require("./models/user");
var methodOverride = require('method-override');


mongoose.connect("mongodb://localhost/stories");

app.use(bodyParser.urlencoded({extended: true}));
app.set('view engine', 'ejs');

// PASSPORT CONFIGURATION
app.use(require("express-session")({
    secret: "Once again Rusty wins cutest dog!",
    resave: false,
    saveUninitialized: false
}));
app.use(methodOverride('_method'));

passport.use(new FacebookStrategy({
        'clientID'      : '1608779752487747',
        'clientSecret'  : 'c4f14e177fa1697449c4bdab11347fa1',
        'callbackURL'   : 'http://localhost:8080/auth/facebook/callback'
  },
  function(accessToken, refreshToken, profile, done) {
    process.nextTick(function () {
      //Check whether the User exists or not using profile.id
      if(config.use_database==='true')
      {
         //Further code of Database.
      }
      return done(null, profile);
    });
  }
));

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

//passport.serializeUser(User.serializeUser());
//passport.deserializeUser(User.deserializeUser());

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});

app.use(function(req, res, next){
   res.locals.currentUser = req.user;
   next();
});

app.get('/auth/facebook', passport.authenticate('facebook'));

app.get('/auth/facebook/callback',  passport.authenticate('facebook', {
       successRedirect : '/',
       failureRedirect: '/login'
  }),
  function(req, res) {
    res.redirect('/');
});

app.get("/",function(req,res){
    res.redirect("index");
});

app.get("/index",function(req,res){
    Stories.find({},function(err,stories){
        
        if(err)
        {
            console.log(err);    
        }
        else
        {
            res.render("index",{stories:stories});
        }
    });
})

app.get("/new",isLoggedIn,function(req,res){
    
    res.render("new");
});
app.post("/index",isLoggedIn, function(req,res){
    
    var name = req.body.name;
    var image = req.body.image;
    var description = req.body.description;
    
    var author = {
        id: req.user._id,
        username: req.user.username
    }
    var newStory = {name:name,image:image,description:description,author:author};
    
    Stories.create(newStory, function(err, newlyCreated){
        if(err){
            console.log(err);
        } else {
            //redirect back to campgrounds page
            res.redirect("/index");
        }
    });
         
})
app.get("/index/:id",function(req, res) {
   
    var id = req.params.id;
    
    Stories.findById(id,function(err,story){
       
       if(err)
       {
           res.redirect("/index");
       }
       else
       {
           res.render("show",{story:story});
       }
        
    });
    
});


app.get("/login",function(req, res) {
    res.render("login");
    
});

app.post("/login", passport.authenticate("local", 
    {
        successRedirect: "/index",
        failureRedirect: "/login"
    }), function(req, res){
});




// register the user and give the authentication
app.post("/register", function(req, res){
    var newUser = new User({username: req.body.username});
    User.register(newUser, req.body.password, function(err, user){
        if(err)
        {
            console.log(err);
            return res.render("register");
        }
        passport.authenticate("local")(req, res, function(){
           res.redirect("/index"); 
        });
    });
});



// logout the user
app.get("/logout", function(req, res){
   req.logout();
   res.redirect("/index");
});

// send the registration form
app.get("/register",function(req, res) {
    res.render("register");
});



app.put("/index/:id",checkAuthorization, function(req, res){
 
    var name = req.body.name;
    var image = req.body.image;
    var description = req.body.description;
    var updateS = {name:name,image:image,description:description};
    
    Stories.findByIdAndUpdate(req.params.id, updateS, function(err, updatedStory){
       if(err){
           res.redirect("/index");
       } else {
           
           res.redirect("/index/" + req.params.id);
       }
    });
});


app.delete("/index/:id",checkAuthorization,function(req,res){
   Stories.findByIdAndRemove(req.params.id, function(err){
      if(err){
          //res.redirect("/index");
      } else {
          res.redirect("/index");
      }
   }); 
    
    
});


app.get("/index/:id/edit",checkAuthorization,function(req, res) {
    
    Stories.findById(req.params.id,function(err,story){
       
       if(err)
       {
           res.redirect("/index");
       }
       else
       {
           res.render("edit",{story:story});
       }
        
    });
    
});
 

//check if user logged in
function isLoggedIn(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect("/login");
}

//check if user has authority
function checkAuthorization(req,res,next){
    if(req.isAuthenticated())
    {
         Stories.findById(req.params.id, function(err, foundStories){
           if(err){
               res.redirect("login");
           }  else {
               if(foundStories.author.id.equals(req.user._id)) {
                    next();
            } else {
            
                res.redirect("login");
            }
           }
        });
        
    }
    else
    {
        res.redirect("login");
    }
    
    
}



app.listen(process.env.PORT, process.env.IP, function(){
   console.log("Server started!");
});