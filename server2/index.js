const express = require('express') 
const mongoose = require('mongoose'); 
const cors = require('cors');

const app = express();
const authRoutes = require('./routes/auth');
const verifyToken = require('./routes/verifyToken')
app.use(express.json());
//check process.env 
require('dotenv').config({path:'.env'})
app.use(cors());
//example using the token to protect a route 
app.get('/api/users/profile', verifyToken, (req,res) => {
    //console.log(req.user)//because it got added in the 'verifyToken' middleware...
    //res.send('This is the PROTECTED user profile')
    res.send({success:true,data: req.user })
})

app.use('/api/users/', authRoutes);
/* mongoose style: does not work yet. Problem: not using mongoose might be casusing issu e with the Schema not working... */
mongoose.connect(`mongodb+srv://${process.env.MONGO_DB_USER}:${process.env.MONGO_DB_PASS}@cluster0.mputo.mongodb.net/${process.env.MONGO_DB_NAME}?retryWrites=true&w=majority`,{ useNewUrlParser: true, useUnifiedTopology: true  })
.then( () => {
    app.listen(process.env.PORT || 3000, ()=> {
        console.log('server is running on port .')
    })
})
.catch( err => console.log(err)) 

//.listen(process.env.PORT || 5000)
/*  
steps: npm install express-validator
steps: npm install bcryptjs
deploying to heroku with new change.
https://nameless-refuge-42185.herokuapp.com/
error: Web process failed to bind to $PORT within 60 seconds of launch

*/

app.get('/', (req,res) => {
    res.send('welcome to the auth system.') 
})

/*
mongoose.connect(`mongodb+srv://${process.env.MONGO_DB_USER}:${process.env.MONGO_DB_PASS}@cluster0.mputo.mongodb.net/${process.env.MONGO_DB_NAME}?retryWrites=true&w=majority`)
*/