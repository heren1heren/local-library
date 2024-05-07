import mongoose, { Schema } from 'mongoose';
const GenreSchema = new Schema({
  name: { type: String, required: true, minLength: 3, maxLength: 100 },
});
GenreSchema.virtual('url').get(function () {
  return `/catalog/genre/${this.id}`;
});

const GenreModel = mongoose.model('GenreModel', GenreSchema);
export default GenreModel;
