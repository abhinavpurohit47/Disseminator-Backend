import mongoose, { Document } from "mongoose";

const Schema = mongoose.Schema;

const fileSchema = new Schema(
    {
        name: {
          type: String,
          required: true,
        },
          email: {
          type: String,
          required: true,
        },
        password: {
          type: String,
          required: true,
        },
      },
      {
        timestamps: true,
      }
  );