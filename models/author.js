import mongoose, { Schema } from 'mongoose';
import { DateTime } from 'luxon';
const AuthorSchema = new Schema({
  first_name: { type: String, required: true, maxLength: 100 },
  family_name: { type: String, required: true, maxLength: 100 },
  date_of_birth: { type: Date },
  date_of_death: { type: Date },
});
AuthorSchema.virtual('name').get(function () {
  let fullName = '';
  if (this.first_name && this.family_name) {
    fullName = `${this.family_name}, ${this.first_name}`;
  }

  return fullName;
});
AuthorSchema.virtual('url').get(function () {
  // We don't use an arrow function as we'll need the this object
  return `/catalog/author/${this._id}`;
});
AuthorSchema.virtual('date_of_birth_formatted').get(function () {
  return this.date_of_birth
    ? DateTime.fromJSDate(this.date_of_birth).toLocaleString(DateTime.DATE_MED)
    : '';
});
AuthorSchema.virtual('date_of_death_formatted').get(function () {
  return this.date_of_death
    ? DateTime.fromJSDate(this.date_of_death).toLocaleString(DateTime.DATE_MED)
    : '';
});
AuthorSchema.virtual('life_span').get(function () {
  if (this.date_of_death && this.date_of_birth) {
    const life_span =
      (DateTime.fromJSDate(this.date_of_death).toSeconds() -
        DateTime.fromJSDate(this.date_of_birth).toSeconds()) /
      31556952;
    const life_span_formatted = +life_span.toFixed(1);
    return DateTime.fromMillis(life_span_formatted);
  }
});
AuthorSchema.virtual('date_of_birth_iso').get(function () {
  const formatted = DateTime.fromJSDate(this.date_of_birth).toISODate();
  return formatted;
});
AuthorSchema.virtual('date_of_death_iso').get(function () {
  const formatted = DateTime.fromJSDate(this.date_of_death).toISODate();
  return formatted;
});
const AuthorModel = mongoose.model('AuthorModel', AuthorSchema);
export default AuthorModel;
