import BookInstanceModel from '../models/bookinstance.js';
import asyncHandler from 'express-async-handler';
import { body, validationResult } from 'express-validator';
import BookModel from '../models/book.js';

export const bookinstance_list = asyncHandler(async (req, res, next) => {
  const allBookInstances = await BookInstanceModel.find()
    .populate('book')
    .exec();
  res.render('bookinstance_list', {
    title: 'Book Instance List',
    bookinstance_list: allBookInstances,
  });
});

export const bookinstance_detail = asyncHandler(async (req, res, next) => {
  const bookInstance = await BookInstanceModel.findById(req.params.id)
    .populate('book')
    .exec();
  if (bookInstance === null) {
    // No results.
    const err = new Error('Book copy not found');
    err.status = 404;
    return next(err);
  }

  res.render('bookinstance_detail', {
    title: 'Book:',
    bookinstance: bookInstance,
  });
});

export const bookinstance_create_get = asyncHandler(async (req, res, next) => {
  // rendering a form
  const allBooks = await BookModel.find({}, 'title').sort({ title: 1 }).exec();

  res.render('bookinstance_form', {
    title: 'Create BookInstance',
    book_list: allBooks,
  });
});

export const bookinstance_create_post = [
  // Validate and sanitize fields. then push results to the request object
  body('book', 'Book must be specified').trim().isLength({ min: 1 }).escape(),
  body('imprint', 'Imprint must be specified')
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body('status').escape(),
  body('due_back', 'Invalid date')
    .optional({ values: 'falsy' })
    .isISO8601()
    .toDate(),

  // Process request after validation and sanitization
  asyncHandler(async (req, res, next) => {
    // Extract the validation errors from the current request object
    const errors = validationResult(req);

    // Create a BookInstance object with escaped and trimmed data.
    const bookInstance = new BookInstanceModel({
      book: req.body.book,
      imprint: req.body.imprint,
      status: req.body.status,
      due_back: req.body.due_back,
    });

    if (!errors.isEmpty()) {
      // There are errors.
      // Render form again as the get middleware function for bookinstance get
      const allBooks = await Book.find({}, 'title').sort({ title: 1 }).exec();

      res.render('bookinstance_form', {
        title: 'Create BookInstance',
        book_list: allBooks,
        selected_book: bookInstance.book._id,
        errors: errors.array(),
        bookinstance: bookInstance,
      });
      return;
    } else {
      // Data from form is valid

      await bookInstance.save();
      res.redirect(bookInstance.url);
    }
  }),
];

export const bookinstance_delete_get = asyncHandler(async (req, res, next) => {
  const bookInstance = await BookInstanceModel.findById(req.params.id)
    .populate('book')
    .exec();
  if (bookInstance === null) {
    // No results.
    const err = new Error('Book copy not found');
    err.status = 404;
    return next(err);
  }

  res.render('bookinstance_delete', {
    title: 'Delete Book Instance',
    bookinstance: bookInstance,
  });
});

export const bookinstance_delete_post = asyncHandler(async (req, res, next) => {
  await BookInstanceModel.findByIdAndDelete(req.body.bookinstanceid);
  res.redirect('/catalog/book');
});

export const bookinstance_update_get = asyncHandler(async (req, res, next) => {
  const allBooks = await BookModel.find({}, 'title').sort({ title: 1 }).exec();
  const bookInstance = await BookInstanceModel.findById(req.params.id).exec();
  console.log(bookInstance);
  res.render('bookinstance_form', {
    title: 'Update BookInstance',
    bookinstance: bookInstance,
    book_list: allBooks,
  });
});

export const bookinstance_update_post = asyncHandler(async (req, res, next) => {
  res.send('NOT IMPLEMENTED: BookInstance update POST');
});
