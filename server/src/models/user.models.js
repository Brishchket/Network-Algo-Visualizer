/*
-----------------------------------------------------------------------------------------
------------------------ IMPORTANT UNDERSTANDING ----------------------------------------
-----------------------------------------------------------------------------------------

User is the Mongoose model created from your schema.
Think of it in 3 layers:
MongoDB          →   actual database (stores data)
Mongoose         →   connects Node.js to MongoDB
User model       →   gives you methods to talk to MongoDB


User is just your remote control for the users collection in MongoDB.
Every method on it (create, findOne, findById, findByIdAndUpdate) translates to a 
database operation.

Mongoose creates a model called User that maps to a collection 
called users in MongoDB automatically.

-----------------------------------------------------------------------------------------
-----------------------------------------------------------------------------------------
-----------------------------------------------------------------------------------------
*/


import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String
    },
    googleId: {
      type: String
    },
    refreshToken: {
      type: String,
    },
  },
  { timestamps: true }
);


userSchema.pre("validate", function (next) {
    if (!this.password && !this.googleId) {
      return next(new Error("User must have either a password or a Google ID."));
    }
    next;
});

// hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.password || !this.isModified("password")) return next;
  this.password = await bcrypt.hash(this.password, 10);
  next;
});

// compare password
userSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

// generate access token
userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    { _id: this._id, email: this.email, username: this.username },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
  );
};

// generate refresh token
userSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    { _id: this._id },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRY }
  );
};

export const User = mongoose.model("User", userSchema);