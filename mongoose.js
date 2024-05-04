import mongoose from 'mongoose';
import { Schema } from 'mongoose';
mongoose.set('strictQuery', false);
const mongoDB =
  'mongodb+srv://heren1heren:aeou&[{}@cluster0.ypym7h4.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
main().catch((err) => console.log(err));
async function main() {
  await mongoose.connect(mongoDB);
}

const aModelSchema = new Schema({
  name: String,
  age: Number,
});
