const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const session = require('express-session');
const mongoStore = require('connect-mongo');
const store = mongoStore.create({
  mongoUrl: 'mongodb://127.0.0.1:27017/login',
  collectionName: 'sessions',
  mongooseConnection: mongoose.connection,
  ttl: 60 * 60, // session TTL in seconds
});


const app = express();
const port = process.env.PORT||3000;

mongoose.connect('mongodb://127.0.0.1:27017/login',{useNewUrlParser:true, useUnifiedTopology:true})
.then(()=>{
    console.log("Connected to Mongo");
})
.catch(()=>{
    console.log("Oops!! mongo not connected");
    console.log(error);
})

// Some of middlewares

app.use(session({
    secret:'my-secret-key',
    resave:false,
    saveUninitiated:false,
    store: store, // use the `store` variable
  }));
  app.set('view engine','ejs');
    app.set('views','views');
    app.use(express.urlencoded({ extended: true }));
    app.use(express.json());  

const UserSchema = new mongoose.Schema({
    username:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    }
});

UserSchema.methods.verifyPassword = function (password) {
    return bcrypt.compareSync(password, this.password);
};

const User = mongoose.model('User',UserSchema);
//creates a Mongoose model called User that represents the 'User' collection in the MongoDB database using the UserSchema schema.

app.get('/',(req,res)=>{
    res.send('Welcome !! Yash Ashok Gokakkar here');
});

app.get('/login',(req,res)=>{
    res.render('login.ejs');
});

app.post('/login',async(req,res)=>{
    const{username, password} = req.body;
    const user = await User.findOne({username});
    if(user&&user.verifyPassword(password)){
        req.session.user_id = user._id;
        res.redirect('/dashboard');
    }
    else{
        res.redirect('/login');
    }
});

app.get('/register',((req,res)=>{
    res.render('register.ejs');
}));

app.post('/register',async(req,res)=>{
    const{username, password} = req.body;
    const user = new User({
        username,
        password:bcrypt.hashSync(password,bcrypt.genSaltSync(10))
    });
    await user.save();
})

app.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.log(err);
        }
        res.redirect('/login');
    });
});
  
app.get('/dashboard',(req,res)=>{
    if(!req.session.user_id){
        res.redirect('/login');
    }
    else{
        res.render('dashboard.ejs')
    }
});

app.listen(port,()=>{
    console.log(`Server listening on port ${port}`);
})


