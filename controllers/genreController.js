import GenreModel from '../models/genre.js';
import asyncHandler from 'express-async-handler';
import BookModel from '../models/book.js';
import { body, validationResult } from 'express-validator';
export const genre_list = asyncHandler(async (req, res, next) => {
  //
  const allGenre = await GenreModel.find({}).sort({ name: 1 }).exec();
  res.render('genre_list', { genre_list: allGenre, title: 'Genre List' });
});

export const genre_detail = asyncHandler(async (req, res, next) => {
  // Get details of genre and all associated books (in parallel)
  const [genre, booksInGenre] = await Promise.all([
    GenreModel.findById(req.params.id).exec(),
    BookModel.find({ genre: req.params.id }, 'title summary').exec(),
  ]);

  if (genre === null) {
    // No results.
    const err = new Error('Genre not found');
    err.status = 404;
    return next(err);
  }

  res.render('genre_detail', {
    title: 'Genre Detail',
    genre: genre,
    genre_books: booksInGenre,
  });
});

export const genre_create_get = asyncHandler(async (req, res, next) => {
  res.render('genre_form', { title: 'Create Genre' });
});

// Handle Genre create on POST
export const genre_create_post = [
  // Validate and sanitize the name field.
  body('name', 'Genre name must contain at least 3 characters')
    .trim()
    .isLength({ min: 3 })
    .escape(),

  // Process request after validation and sanitization.
  asyncHandler(async (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    // Create a genre object with escaped and trimmed data.
    const genre = new GenreModel({ name: req.body.name }); // req.body has data value call name

    if (!errors.isEmpty()) {
      // There are errors. Render the form again with sanitized values/error messages.
      res.render('genre_form', {
        title: 'Create Genre',
        genre: genre,
        errors: errors.array(),
      });
      return;
    } else {
      // Data from form is valid.
      // Check if Genre with same name already exists.
      const genreExists = await GenreModel.findOne({
        name: req.body.name,
      }).exec();
      if (genreExists) {
        // Genre exists, redirect to its detail page.
        res.redirect(genreExists.url);
      } else {
        await genre.save();
        // New genre saved. Redirect to genre detail page.
        res.redirect(genre.url);
      }
    }
  }),
];

export const genre_delete_get = asyncHandler(async (req, res, next) => {
  // display genre_delete form
  // what data is needed: booksbygenre, genre itself
  const [genre, booksByGenre] = await Promise.all([
    GenreModel.findById(req.params.id).exec(),
    BookModel.find({ genre: req.params.id }, { title: 1, summary: 1 }).exec(),
  ]);

  res.render('genre_delete', {
    title: 'Delete Genre',
    genre: genre,
    books: booksByGenre,
  });
});

export const genre_delete_post = asyncHandler(async (req, res, next) => {
  //
  const [genre, booksByGenre] = await Promise.all([
    GenreModel.findById(req.params.id).exec(),
    BookModel.find({ genre: req.params.id }, { title: 1, summary: 1 }).exec(),
  ]);

  if (booksByGenre.length > 0) {
    // Author has books. Render in same way as for GET route.
    res.render('genre_delete', {
      title: 'Delete Genre',
      genre: genre,
      books: booksByGenre,
    });
    return;
  } else {
    // Author has no books. Delete object and redirect to the list of authors.
    await GenreModel.findByIdAndDelete(req.body.genreid);
    res.redirect('/catalog/genres');
  }
});

export const genre_update_get = asyncHandler(async (req, res, next) => {
  // display genre_delete form
  // fetch genre itself value to display
  const genre = await GenreModel.findById(req.params.id).exec();
  res.render('genre_form', { title: 'Update Genre', genre: genre });
});

export const genre_update_post = [
  // Convert the genre to an array.
  (req, res, next) => {
    if (!Array.isArray(req.body.genre)) {
      req.body.genre =
        typeof req.body.genre === 'undefined' ? [] : [req.body.genre];
    }
    next();
  },

  // Validate and sanitize fields.
  body('name', 'Genre name must contain at least 3 characters')
    .trim()
    .isLength({ min: 3 })
    .escape(),
  // Process request after validation and sanitization.
  asyncHandler(async (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    // Create a genre object with escaped and trimmed data.
    const genre = new GenreModel({ name: req.body.name, _id: req.params.id }); // req.body has data value call name

    if (!errors.isEmpty()) {
      // There are errors. Render the form again with sanitized values/error messages.
      res.render('genre_form', {
        title: 'Create Genre',
        genre: genre,
        errors: errors.array(),
      });
      return;
    } else {
      // Data from form is valid.
      // Check if Genre with same name already exists.
      const genreExists = await GenreModel.findOne({
        name: req.body.name,
      }).exec();
      if (genreExists) {
        // Genre exists, redirect to its detail page.
        res.redirect(genreExists.url);
      } else {
        const updatedGenre = await GenreModel.findByIdAndUpdate(
          req.params.id,
          genre,
          {}
        );

        // New genre saved. Redirect to genre detail page.
        res.redirect(updatedGenre.url);
      }
    }
  }),
];
