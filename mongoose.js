import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
dotenv.config();
mongoose.set('strictQuery', false);
// const dev_db_url =
//   'mongodb+srv://your_user_name:your_password@cluster0.lz91hw2.mongodb.net/local_library?retryWrites=true&w=majority';
const uri = process.env.sample;
main().catch((err) => console.log(err));
async function main() {
  console.log(process.env.sample); // this is okay
  // console.log(process.env.MONGODB_URI); // this is undefined
  await mongoose.connect(uri);
}
