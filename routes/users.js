var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});
router.get('/cool',function(req,res,next){
  res.send("You're so cool");
})


module.exports = router;



// var mongoose = require('mongoose')
// var mongoDB = 'mongodb://127.0.0.1/my_database';
// mongoose.connect(mongoDB, {useNewUrlParser: true})
// var db = mongoose.connection;
// db.on('error',console.error.bind(console,'MongoDB connection error'));
// var Schema = mongoose.Schema
// var SomeModeSchema = new Schema({
//   'name':String,
// });
// var SomeModel= mongoose.model('SomeModel',SomeModeSchema);
// var instance = new SomeModel({'name':'Mannan'})
// instance.save(function (err){
//   if(err) return handleError(err)
// })
// instance.name = "Mohit"
// console.log(instance.name)
