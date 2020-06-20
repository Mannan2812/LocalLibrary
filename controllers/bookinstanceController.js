var BookInstance = require('../models/bookinstance');
const { body,validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');
var Book = require('../models/book');
// Display list of all BookInstances.
exports.bookinstance_list = function(req, res,next) {
    BookInstance.find().populate('book').exec(function (err,list_bookInstances){
      if(err){ return next(err) }
      res.render('bookinstance_list',{ title: 'Book Instance List', bookinstance_list: list_bookInstances });
    });
};

// Display detail page for a specific BookInstance.
exports.bookinstance_detail = function(req, res,next) {
    BookInstance.findById(req.params.id).populate('book').exec(function (err,bookinstance){
      if(err) return next(err)
      if(bookinstance==null){
        var err = new Error("Book Copy not found")
        err.statusCode = 404;
        return next(err);
      }
       res.render('bookinstance_detail', { title: 'Copy: '+bookinstance.book.title, bookinstance:  bookinstance});
    })
};

// Display BookInstance create form on GET.
exports.bookinstance_create_get = function(req, res) {
  Book.find({},'title')
 .exec(function (err, books) {
   if (err) { return next(err); }
   // Successful, so render.
   res.render('bookinstance_form', {title: 'Create BookInstance', book_list: books});
 });
};

// Handle BookInstance create on POST.
exports.bookinstance_create_post =  [

    // Validate fields.
    body('book', 'Book must be specified').trim().isLength({ min: 1 }),
    body('imprint', 'Imprint must be specified').trim().isLength({ min: 1 }),
    body('due_back', 'Invalid date').optional({ checkFalsy: true }).isISO8601(),

    // Sanitize fields.
    sanitizeBody('book').escape(),
    sanitizeBody('imprint').escape(),
    sanitizeBody('status').trim().escape(),
    sanitizeBody('due_back').toDate(),

    // Process request after validation and sanitization.
    (req, res, next) => {

        // Extract the validation errors from a request.
        const errors = validationResult(req);

        // Create a BookInstance object with escaped and trimmed data.
        var bookinstance = new BookInstance(
          { book: req.body.book,
            imprint: req.body.imprint,
            status: req.body.status,
            due_back: req.body.due_back
           });

        if (!errors.isEmpty()) {
            // There are errors. Render form again with sanitized values and error messages.
            Book.find({},'title')
                .exec(function (err, books) {
                    if (err) { return next(err); }
                    // Successful, so render.
                    res.render('bookinstance_form', { title: 'Create BookInstance', book_list: books, selected_book: bookinstance.book._id , errors: errors.array(), bookinstance: bookinstance });
            });
            return;
        }
        else {
            // Data from form is valid.
            bookinstance.save(function (err) {
                if (err) { return next(err); }
                   // Successful - redirect to new record.
                   res.redirect(bookinstance.url);
                });
        }
    }
];

// Display BookInstance delete form on GET.
exports.bookinstance_delete_get = function(req, res,next) {
  BookInstance.findById(req.params.id).populate('book').exec(function(err,result){
    if(err) next(err);
    res.render('bookinstance_delete',{title:"BookInstance Delete",bookinstance:result,book:result.book})
  })
};

// Handle BookInstance delete on POST.
exports.bookinstance_delete_post = function(req, res,next) {
  BookInstance.findByIdAndRemove(req.params.id).exec(function (err){
    if(err) return next(err)
    res.redirect('/catalog/bookinstances')
  })
};

// Display BookInstance update form on GET.
exports.bookinstance_update_get = function(req, res,next) {
  async.parallel({
    bookinstance:function(callback){
      BookInstance.findById(req.params.id).populate('book').exec(callback)
    },
    book_list:function(callback){
      Book.find({},'title').exec(callback)
    },
  },function(err,results){
    if(err) return next(err);
    console.log(results.bookinstance.status)
    res.render('bookinstance_form',{title:'BookInstance Update',bookinstance:results.bookinstance,book_list:results.book_list})
  })

};

// Handle bookinstance update on POST.
exports.bookinstance_update_post = [
  body('book', 'Book must be specified').trim().isLength({ min: 1 }),
  body('imprint', 'Imprint must be specified').trim().isLength({ min: 1 }),
  body('due_back', 'Invalid date').optional({ checkFalsy: true }).isISO8601(),

  // Sanitize fields.
  sanitizeBody('book').escape(),
  sanitizeBody('imprint').escape(),
  sanitizeBody('status').trim().escape(),
  sanitizeBody('due_back').toDate(),
  (req,res,next)=>{
    const errors = validationResult(req)
    var bookinstance = new BookInstance({
            book:req.body.book,
            imprint:req.body.imprint,
            status:req.body.status,
            _id:req.params.id,
            due_back:req.body.due_back,
    })
    if(!errors.isEmpty()){
          Book.find({},'title').exec(function(err,results){
        if(err) return next(err);
        console.log(results.bookinstance.status)
        res.render('bookinstance_form',{title:'BookInstance Update',bookinstance:results.bookinstance,book_list:results.book_list,errors:errors.array()})
      })
    }
    else{
      BookInstance.findByIdAndUpdate(req.params.id,bookinstance,{},function(err,thebookinstance){
        if(err) return next(err)
        res.redirect(thebookinstance.url)
      })
    }
  }
]
