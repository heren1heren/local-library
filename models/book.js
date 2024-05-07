import mongoose, { Schema } from 'mongoose';
const BookSchema = new Schema({
  title: { type: String, required: true },
  author: { type: Schema.Types.ObjectId, ref: 'AuthorModel', required: true },
  summary: { type: String, required: true },
  isbn: { type: String, required: true },
  genre: [{ type: Schema.Types.ObjectId, ref: 'GenreModel' }],
});
BookSchema.virtual('url').get(function () {
  // We don't use an arrow function as we'll need the this object
  return `/catalog/book/${this._id}`;
});
const BookModel = mongoose.model('BookModel', BookSchema);
export default BookModel;
