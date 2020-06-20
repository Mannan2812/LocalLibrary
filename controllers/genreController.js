var Genre = require('../models/genre');
var async  = require('async')
var Book = require('../models/book')
const validator = require('express-validator');
// Display list of all Genre.
exports.genre_list = function(req, res,next) {
    Genre.find().populate('genre').exec(function (err,genre_list){
      if(err) return next(err);
      res.render('genre_list',{title:"Genre List",genre_list:genre_list})
    })
};

// Display detail page for a specific Genre.
exports.genre_detail = function(req, res,next) {
    async.parallel({
      genre: function(callback) {
            Genre.findById(req.params.id)
              .exec(callback);
        },
        genre_books: function(callback) {
            Book.find({ 'genre': req.params.id })
              .exec(callback);
        },
    },function (err,results) {
      if(err) return next(err);
      if(results.genre==null){
        var err = new Error('Genre Not Found')
        err.status = 404;
        return next(err)
      }
      res.render('genre_detail', { title: 'Genre Detail', genre: results.genre, genre_books: results.genre_books } );
        })
};

// Display Genre create form on GET.
exports.genre_create_get = function(req, res) {
    res.render('genre_form',{title:'Create Genre'})
};

// Handle Genre create on POST.
exports.genre_create_post = [
  validator.body('name','Genre name required').trim().isLength({min:1}),
  validator.sanitizeBody('name').escape(),
  (req,res,next) =>{
    const errors = validator.validationResult(req)
    var genre = new Genre({name:req.body.name});
    if(!errors.isEmpty()){
      res.render('genre_form',{ title: 'Create Genre', genre: genre, errors: errors.array()})
      return;
    }
    else{
      Genre.findOne({'name':req.body.name}).exec(function(err,found_genre){
        if(err){return next(err);}
        if(found_genre) res.redirect(found_genre.url);
        else{
          genre.save(function(err){
            if(err) return next(err);
            res.redirect(genre.url);
          })
        }
      })
    }
  },

];

// Display Genre delete form on GET.
exports.genre_delete_get = function(req, res,next) {
    async.parallel({
      genre:function (callback){
        Genre.findById(req.params.id).exec(callback)
      },
      book: function (callback){
        Book.find({genre:req.params.id},'title').exec(callback)
      }
    },function(err,results){
      if(err) return next(err)
      res.render('genre_delete',{title:"Genre Delete",genre: results.genre,book:results.book})
    })
};

// Handle Genre delete on POST.
exports.genre_delete_post = function(req, res, next) {

    async.parallel({
        genre: function(callback) {
          Genre.findById(req.body.genreid).exec(callback)
        },
        genre_books: function(callback) {
          Book.find({ 'genre': req.body.genreid}).exec(callback)
        },
    }, function(err, results) {
        if (err) { return next(err); }
        // Success
        if (results.genre_books.length > 0) {
            // Author has books. Render in same way as for GET route.
            res.render('genre_delete', { title: 'Delete Genre', author: results.genre, book: results.genre_books } );
            return;
        }
        else {
            // Author has no books. Delete object and redirect to the list of authors.
            Genre.findByIdAndRemove(req.body.genreid, function deleteAuthor(err) {
                if (err) { return next(err); }
                // Success - go to author list
                res.redirect('/catalog/geners')
            })
        }
    });
};

// Display Genre update form on GET.
exports.genre_update_get = function(req, res,next) {
    Genre.findById(req.params.id).exec(function (err,genre){
      if(err) return next(err)
      res.render('genre_form',{title:'Genre Update',genre:genre})
    })
};

// Handle Genre update on POST.
exports.genre_update_post = [
  validator.body('name','Genre name required').trim().isLength({min:1}),
  validator.sanitizeBody('name').escape(),
  (req,res,next) =>{
    const errors = validator.validationResult(req)
    var genre = new Genre({name:req.body.name,_id:req.params.id});
    if(!errors.isEmpty()){
      res.render('genre_form',{ title: 'Create Genre', genre: genre, errors: errors.array()})
    }
    else{
      Genre.findByIdAndUpdate(req.params.id,genre,{},function (err,genre){
        if(err) return next(err)
        res.redirect(genre.url)
      })
    }
  }
]
