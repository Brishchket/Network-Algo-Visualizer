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
    fullName: {
      type: String,
      trim: true,
      maxLength: 60,
    },
    avatar: {
      type: String,
    },
    bio: {
      type: String,
      trim: true,
      maxLength: 160,
    }
  },
  { timestamps: true }
);

userSchema.set('toJSON', {
  transform: function (doc, ret, options) {
    delete ret.password;
    delete ret.refreshToken;
    delete ret.googleId;
    delete ret.__v;
    return ret;
  }
});

userSchema.pre("validate", function () {
    if (!this.password && !this.googleId) {
      throw new Error("User must have either a password or a Google ID.");
    }
});

// hash password before saving
userSchema.pre("save", async function () {
  if (!this.password || !this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 10);
});

// compare password
userSchema.methods.isPasswordCorrect = async function (password) {
  if (!this.password) return false;
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