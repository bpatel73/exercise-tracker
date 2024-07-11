const express = require('express')
const app = express()
const cors = require('cors')
let mongoose = require('mongoose');
let bodyParser = require('body-parser');
require('dotenv').config()

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    require: true
  }
});

const exerciseSchema = new mongoose.Schema({
  userId: {
    type: String,
    require: true
  },
  description: {
    type: String,
    required: true
  },
  duration: {
    type: Number,
    required: true
  },
  date: String
});

const User = mongoose.model('User', userSchema);
const Exercise = mongoose.model('Exercise', exerciseSchema);

app.use(cors())
app.use(express.static('public'))
app.use(bodyParser.urlencoded({extended: false}));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

app.get('/api/users', function(req, res){
  User.find({}, function(err, data){
    if(err){
      res.send('Error occured');
      return console.log(err);
    }
    res.json(data);
  });
});

app.post('/api/users', function(req, res){
  const usrnm = req.body.username;
  var usr = new User({username: usrnm});
  usr.save(function(err, data){
    if(err){
      res.send('error occured while saving.');
      return console.log(err);
    }
    res.json({
      username: data.username,
      _id: data._id
    });
  });
});

app.post('/api/users/:id/exercises', function(req, res){
  var user_id = req.params.id;
  User.findOne({_id: user_id}, function(err, usr){
    if(err){
      res.send('error: could not find one.');
      return console.log(err);
    }
    let date;
    if(req.body.date){
      date = new Date(req.body.date);
    }else{
      date = new Date();
    }
    var exercise = new Exercise({userId: user_id, description: req.body.description, duration: req.body.duration, date: date.toDateString()});
    exercise.save(function(err, exer){
      if(err){
        res.send('error occured while saving.');
        return console.log(err);
      }
      res.json({
        username: usr.username,
        description: exer.description,
        duration: exer.duration,
        date: exer.date,
        _id: usr._id
      });
    });
  });
});

app.get('/api/users/:id/logs', function(req, res){
  var user_id = req.params.id;
  const {from, to, limit} = req.query;
  console.log(from, to, limit);
  User.findOne({_id: user_id}, function(err, usr){
    if(err){
      res.send('error: could not find one.');
      return console.log(err);
    }
    Exercise.find({userId: user_id}, function(err, data){
      if(err){
        console.log(err);
      }
      var count = data.length;
      res.json({
        username: usr.username,
        count: count,
        _id: usr._id,
        log: data
      });
    });
  });
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
