const express= require("express");
const routes= express.Router();
const mongoose=require('mongoose');
const bodyParser=require('body-parser');
const bcrypt=require('bcryptjs');
const user =require('./models.js');
const passport= require('passport');
const session= require('express-session');
const cookieParser= require('cookie-parser');
const flash=require('connect-flash');




routes.use(bodyParser.urlencoded({extended:true}));;

routes.use(cookieParser('secret'));
routes.use(session({
    secret:'secret',
    maxAge:360000,
    resave:true,
    saveUninitialized:true,
}));

routes.use(passport.initialize());
routes.use(passport.session());
routes.use(flash());
routes.use(function(req,res,next){
    res.locals.success_message=req.flash('success_message')
    res.locals.error_message=req.flash('error_message')
    res.locals.error=req.flash('error')
    next();
});

const checkAuthenticate=function(req,res,next){
    if(req.isAuthenticated()){
        res.set('Cache-control','no-cache,private,no-store,must-revalidate,post-check=0,re-check=0');
        return next(); 
    }else{
        res.redirect('/login');
    }
}



mongoose.connect('mongodb+srv://rajshukla1102:rajshukla1102@cluster0.eszou.mongodb.net/userDB?retryWrites=true&w=majority',{
    useNewUrlParser:true,
    useUnifiedTopology:true,
    useFindAndModify:false
}).then(()=>console.log("Database Connected"));





routes.get('/',(req,res)=>{
    res.render("register")
})

routes.post('/register',(req,res)=>{
    var{name,email,password,confirmpassword}=req.body;
    var err;
    if(!email||!name||!password||!confirmpassword){
        err="Please fill the form correctly"
        res.render('register',{"err":err})
    }
    if(password!=confirmpassword)
    {
        err=`Password don't match..Try again!`
        res.render('register',{"err":err,'name':name,'email':email})
    }
    if(typeof err=='undefined'){
        user.findOne({email:email},function(err,data){
            if(err) throw err
            if(data){
                console.log("user exist")
                err="User exist with this email"
                res.render('register',{
                    'err':err,
                    'name':name,
                    'email':email})
            }
            else{
                bcrypt.genSalt(10,(err,salt)=>{
                    if(err) throw err;
                    bcrypt.hash(password,salt,(err,hash)=>{
                        if(err)throw err
                        password =hash;
                        user({
                            email,password,name
                        }).save((err,data)=>{
                            if (err) throw err
                            req.flash('success_message','Succesfully Registered!')
                            res.redirect('/login')
                        })
                    })
                })
                

            }
        });
    }
});
//start of local startegy
var localStrategy=require('passport-local').Strategy;
passport.use(new localStrategy({usernameField:'email'},(email,password,done)=>{
    user.findOne({email:email},(err,data)=>{
        if(err)throw err;
        if(!data){
            return done(null,false,{message:"User doesnt exst"})
        }
        bcrypt.compare(password,data.password,(err,match)=>{
            if(err){
                return done(null, false)
            }
            if(!match){
                return done(null,false,{message:"password doesnt exst"})
            }
            if(match){
                return done(null,data)
            }
        })
    })
}));
passport.serializeUser(function(user,cb){
    cb(null,user.id)

});
passport.deserializeUser(function(id,cb){
    user.findById(id,function(err,user){
        cb(err,user)
    })
});
//end of autentication strategy
        routes.get('/login',(req,res)=>{
            res.render('login')
});

routes.post('/login',(req,res,next)=>{
    passport.authenticate('local',{
        failureRedirect:'/login',
        successRedirect:'/index',
        failureFlash:true,
    })(req,res,next);

});                                          
routes.get('/index',checkAuthenticate,(req,res)=>{
    res.render('index',{user: req.user});

});
routes.get('/logout',(req,res)=>{
    req.logOut();
    res.redirect('/login')
});
routes.post('/addmsg',checkAuthenticate, (req, res) => {
    user.findOneAndUpdate(

        { email: req.user.email },
        {
            $push: {
                messages: req.body['msg']
              
            }
        }, (err, suc) => {
            if (err) throw err;
            if (suc) console.log("Added Successfully...");
        }
        );
        res.redirect('/index')
    });

module.exports=routes