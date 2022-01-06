import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import mongoose from 'mongoose';
import connectDB from './config/db';
import fileRoute from './routers/files';

import {v2 as cloudinary} from'cloudinary';

const app = express()
dotenv.config()

cloudinary.config({
    cloud_name:process.env.CLOUDINARY_API_CLOUD,
    api_key:process.env.CLOUDINARY_API_KEY,
    api_secret:process.env.CLOUDINARY_API_SECRET,
    api_env_var:process.env.CLOUDINARY_API_ENV_VAR
})

mongoose
  .connect(
    process.env.MONGO_URI as string,
    { useNewUrlParser: true ,useUnifiedTopology: true}
  )
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log(err));

connectDB();
app.use(cors());
app.use(express.json())
app.use(express.urlencoded({
    extended:true,
}))

app.use("/api/files",fileRoute)

const PORT = process.env.PORT;

app.listen (PORT , () => console.log(`Server is listening on PORT ${PORT}`));