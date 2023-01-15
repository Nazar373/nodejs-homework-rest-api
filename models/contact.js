const mongoose = require("mongoose");

mongoose.set("strictQuery", false);

const schema = mongoose.Schema({
  name: {
    type: String,
    required: [true, "Set name for contact"],
    unique: [true, "User with this name is already registered"]
  },
  email: {
    type: String,
    unique: [true, "User with this email is already registered"]
  },
  phone: {
    type: String,
    unique: [true, "User with this phone is already registered"]
  },
  favorite: {
    type: Boolean,
    default: false,
  },
});

const handleErrors = (error, data, next) => {
  console.log("handleErrors")
  const {name, code} = error;
  if(name === "MongoServerError" && code === 11000) {
    error.status = 409
  } else {
    error.status = 400
  }
  next()
}

schema.post("save", handleErrors)

const Contact = mongoose.model("contact", schema);

module.exports = Contact