import AuthorModel from '../models/author.js';
import asyncHandler from 'express-async-handler';
import BookModel from '../models/book.js';
import { body, validationResult } from 'express-validator';
export const author_list = asyncHandler(async (req, res, next) => {
  const allAuthors = await AuthorModel.find().sort({ family_name: 1 }).exec();
  res.render('author_list', {
    title: 'Author List',
    author_list: allAuthors,
  });
});

export const author_detail = asyncHandler(async (req, res, next) => {
  //
  const [author, allBooksByAuthor] = await Promise.all([
    AuthorModel.findById(req.params.id).exec(),
    BookModel.find({ author: req.params.id }, 'title summary').exec(),
  ]);
  if (author === null) {
    // No results.
    const err = new Error('Author not found');
    err.status = 404;
    return next(err);
  }
  console.log(author.life_span);
  res.render('author_detail', {
    title: 'Author Detail',
    author: author,
    author_books: allBooksByAuthor,
  });
});

export const author_create_get = asyncHandler(async (req, res, next) => {
  res.render('author_form', { title: 'Create Author' });
});

export const author_create_post = [
  // Validate and sanitize fields.
  body('first_name')
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage('First name must be specified.')
    .isAlphanumeric()
    .withMessage('First name has non-alphanumeric characters.'),
  body('family_name')
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage('Family name must be specified.')
    .isAlphanumeric()
    .withMessage('Family name has non-alphanumeric characters.'),
  body('date_of_birth', 'Invalid date of birth')
    .optional({ values: 'falsy' })
    .isISO8601()
    .toDate(),
  body('date_of_death', 'Invalid date of death')
    .optional({ values: 'falsy' })
    .isISO8601()
    .toDate(),

  // Process request after validation and sanitization.
  asyncHandler(async (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    // Create Author object with escaped and trimmed data
    const author = new AuthorModel({
      first_name: req.body.first_name,
      family_name: req.body.family_name,
      date_of_birth: req.body.date_of_birth,
      date_of_death: req.body.date_of_death,
    });

    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitized values/errors messages.
      res.render('author_form', {
        title: 'Create Author',
        author: author,
        errors: errors.array(),
      });
      return;
    } else {
      // Data from form is valid.

      // Save author.
      await author.save();
      // Redirect to new author record.
      res.redirect(author.url);
    }
  }),
];

export const author_delete_get = asyncHandler(async (req, res, next) => {
  // Get details of author and all their books (in parallel)
  const [author, allBooksByAuthor] = await Promise.all([
    AuthorModel.findById(req.params.id).exec(),
    BookModel.find({ author: req.params.id }, 'title summary').exec(),
  ]);

  if (author === null) {
    // No results.
    res.redirect('/catalog/authors');
  }

  res.render('author_delete', {
    title: 'Delete Author',
    author: author,
    author_books: allBooksByAuthor,
  });
});

export const author_delete_post = asyncHandler(async (req, res, next) => {
  // Get details of author and all their books (in parallel)
  const [author, allBooksByAuthor] = await Promise.all([
    AuthorModel.findById(req.params.id).exec(),
    BookModel.find({ author: req.params.id }, 'title summary').exec(),
  ]);
  console.log(req.body);

  if (allBooksByAuthor.length > 0) {
    // Author has books. Render in same way as for GET route.
    res.render('author_delete', {
      title: 'Delete Author',
      author: author,
      author_books: allBooksByAuthor,
    });
    return;
  } else {
    // Author has no books. Delete object and redirect to the list of authors.
    await AuthorModel.findByIdAndDelete(req.body.authorid);
    res.redirect('/catalog/authors');
  }
});

export const author_update_get = asyncHandler(async (req, res, next) => {
  // render author form
  // fetch author data,
  const author = await AuthorModel.findById(req.params.id).exec();
  console.log(author.date_of_death_iso);
  res.render('author_form', { title: 'Update Author', author: author });
});

export const author_update_post = [
  // validate data
  // then async update newauthor to oldauthor by .findByIdAndUpdate
  body('first_name', 'First name must not be empty.')
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body('family_name', 'Family name must not be empty.')
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body('date_of_birth', 'Date of birth must not be empty.')
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body('date_of_death', 'date of death must not be empty')
    .trim()
    .isLength({ min: 1 })
    .escape(),

  // Process request after validation and sanitization.
  asyncHandler(async (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    // Create a Book object with escaped/trimmed data and old id.
    const author = new AuthorModel({
      first_name: req.body.first_name,
      family_name: req.body.family_name,
      date_of_birth: req.body.date_of_birth,
      date_of_death: req.body.date_of_death,
      _id: req.params.id, // This is required, or a new ID will be assigned!
    });

    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitized values/error messages.

      // Get all authors and genres for form

      res.render('author_form', {
        title: 'Update Author',
        author: author,
        errors: errors.array(),
      });
      return;
    } else {
      // Data from form is valid. Update the record.
      const updatedAuthor = await AuthorModel.findByIdAndUpdate(
        req.params.id,
        author,
        {}
      );
      // Redirect to book detail page.
      res.redirect(updatedAuthor.url);
    }
  }),
];
