import asyncHandler from 'express-async-handler';
import BookModel from '../models/book.js';
import BookInstanceModel from '../models/bookinstance.js';
import AuthorModel from '../models/author.js';
import GenreModel from '../models/genre.js';
import { body, Result, validationResult } from 'express-validator';
export const index = asyncHandler(async (req, res, next) => {
  const [
    numBooks,
    numBookInstances,
    numAvailableBookInstances,
    numAuthors,
    numGenres,
  ] = await Promise.all([
    BookModel.countDocuments({}).exec(),
    BookInstanceModel.countDocuments({}).exec(),
    BookInstanceModel.countDocuments({ status: 'Available' }).exec(),
    AuthorModel.countDocuments({}).exec(),
    GenreModel.countDocuments({}).exec(),
  ]);

  res.render('index', {
    title: 'Local Library Home',
    book_count: numBooks,
    book_instance_count: numBookInstances,
    book_instance_available_count: numAvailableBookInstances,
    author_count: numAuthors,
    genre_count: numGenres,
  });
});

export const book_list = asyncHandler(async (req, res, next) => {
  const allBooks = await BookModel.find({}, 'title author')
    .sort({ title: 1 })
    .populate('author')
    .exec();

  res.render('book_list', { title: 'Book List', book_list: allBooks });
});

export const book_detail = asyncHandler(async (req, res, next) => {
  const [book, bookInstances] = await Promise.all([
    BookModel.findById(req.params.id)
      .populate('author')
      .populate('genre')
      .exec(),
    BookInstanceModel.find({ book: req.params.id }).exec(),
  ]);

  if (book === null) {
    // No results.
    const err = new Error('Book not found');
    err.status = 404;
    return next(err);
  }

  res.render('book_detail', {
    title: book.title,
    book: book,
    book_instances: bookInstances,
  });
});

export const book_create_get = asyncHandler(async (req, res, next) => {
  const [allAuthors, allGenres] = await Promise.all([
    AuthorModel.find().sort({ family_name: 1 }).exec(),
    GenreModel.find().sort({ name: 1 }).exec(),
  ]);
  console.log(allAuthors);
  console.log(allGenres);
  res.render('book_form', {
    title: 'Create Book',
    authors: allAuthors,
    genres: allGenres,
  });
});

export const book_create_post = [
  (req, res, next) => {
    if (!Array.isArray(req.body.genre)) {
      req.body.genre =
        typeof req.body.genre === 'undefined' ? [] : [req.body.genre];
    }
    next();
  },

  // Validate and sanitize fields.
  body('title', 'Title must not be empty.')
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body('author', 'Author must not be empty.')
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body('summary', 'Summary must not be empty.')
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body('isbn', 'ISBN must not be empty').trim().isLength({ min: 1 }).escape(),
  body('genre.*').escape(),
  // Process request after validation and sanitization.

  asyncHandler(async (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    // Create a Book object with escaped and trimmed data.
    const book = new BookModel({
      title: req.body.title,
      author: req.body.author,
      summary: req.body.summary,
      isbn: req.body.isbn,
      genre: req.body.genre,
    });

    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitized values/error messages.

      // Get all authors and genres for form.
      const [allAuthors, allGenres] = await Promise.all([
        Author.find().sort({ family_name: 1 }).exec(),
        Genre.find().sort({ name: 1 }).exec(),
      ]);

      // Mark our selected genres as checked.
      for (const genre of allGenres) {
        if (book.genre.includes(genre._id)) {
          genre.checked = 'true';
        }
      }
      res.render('book_form', {
        title: 'Create Book',
        authors: allAuthors,
        genres: allGenres,
        book: book,
        errors: errors.array(),
      });
    } else {
      // Data from form is valid. Save book.
      await book.save();
      res.redirect(book.url);
    }
  }),
];

export const book_delete_get = asyncHandler(async (req, res, next) => {
  // create a form for deleting book
  //get required data
  const [book, bookInstances] = await Promise.all([
    BookModel.findById(req.params.id).exec(),
    BookInstanceModel.find({ book: req.params.id }).exec(),
  ]);
  // rendering deleting form

  res.render('book_delete', {
    title: book.title,
    book: book,
    book_instances: bookInstances,
  });
});

export const book_delete_post = asyncHandler(async (req, res, next) => {
  const [book, bookInstances] = await Promise.all([
    BookModel.findById(req.params.id).exec(),
    BookInstanceModel.find({ book: req.params.id }).exec(),
  ]);
  console.log(req.body);

  if (bookInstances.length > 0) {
    // Author has books. Render in same way as for GET route.
    res.render('book_delete', {
      title: 'Delete Book',
      book: book,
      book_instances: bookInstances,
    });
    return;
  } else {
    // Author has no books. Delete object and redirect to the list of authors.
    await BookModel.findByIdAndDelete(req.body.bookid);
    res.redirect('/catalog/books');
  }
});

export const book_update_get = asyncHandler(async (req, res, next) => {
  // Get book, authors and genres for form.
  const [book, allAuthors, allGenres] = await Promise.all([
    BookModel.findById(req.params.id).populate('author').exec(),
    AuthorModel.find().sort({ family_name: 1 }).exec(),
    GenreModel.find().sort({ name: 1 }).exec(),
  ]);

  if (book === null) {
    // No results.
    const err = new Error('Book not found');
    err.status = 404;
    return next(err);
  }

  // Mark our selected genres as checked.
  allGenres.forEach((genre) => {
    if (book.genre.includes(genre._id)) genre.checked = 'true';
  });

  res.render('book_form', {
    title: 'Update Book',
    authors: allAuthors,
    genres: allGenres,
    book: book,
  });
});

export const book_update_post = [
  // Convert the genre to an array.
  (req, res, next) => {
    if (!Array.isArray(req.body.genre)) {
      req.body.genre =
        typeof req.body.genre === 'undefined' ? [] : [req.body.genre];
    }
    next();
  },

  // Validate and sanitize fields.
  body('title', 'Title must not be empty.')
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body('author', 'Author must not be empty.')
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body('summary', 'Summary must not be empty.')
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body('isbn', 'ISBN must not be empty').trim().isLength({ min: 1 }).escape(),
  body('genre.*').escape(),

  // Process request after validation and sanitization.
  asyncHandler(async (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    // Create a Book object with escaped/trimmed data and old id.
    const book = new BookModel({
      title: req.body.title,
      author: req.body.author,
      summary: req.body.summary,
      isbn: req.body.isbn,
      genre: typeof req.body.genre === 'undefined' ? [] : req.body.genre,
      _id: req.params.id, // This is required, or a new ID will be assigned!
    });

    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitized values/error messages.

      // Get all authors and genres for form
      const [allAuthors, allGenres] = await Promise.all([
        Author.find().sort({ family_name: 1 }).exec(),
        Genre.find().sort({ name: 1 }).exec(),
      ]);

      // Mark our selected genres as checked.
      for (const genre of allGenres) {
        if (book.genre.indexOf(genre._id) > -1) {
          genre.checked = 'true';
        }
      }
      res.render('book_form', {
        title: 'Update Book',
        authors: allAuthors,
        genres: allGenres,
        book: book,
        errors: errors.array(),
      });
      return;
    } else {
      // Data from form is valid. Update the record.
      const updatedBook = await BookModel.findByIdAndUpdate(
        req.params.id,
        book,
        {}
      );
      // Redirect to book detail page.
      res.redirect(updatedBook.url);
    }
  }),
];
