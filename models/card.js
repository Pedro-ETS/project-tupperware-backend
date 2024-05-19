const mongoose = require("mongoose");

const validator = require("validator");

const cardSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 50,
  },
  priceNormal:{
    type: String,
    required: true,
    minlength: 2,
    maxlength: 10,
  },
  price:{
    type: String,
    required: true,
    minlength: 2,
    maxlength: 10,
  },
  stock:{
    type: String,
    required: true,
    minlength: 1,
    maxlength: 5,
  },
  link: {
    type: String,
    required: true,
    validate: {
      validator: function (v) {
        return /https?:\/\/(www\.)?[a-zA-Z0-9\-]+(\.[a-zA-Z]{2,})?([a-zA-Z0-9\-._~:\/?%#\[\]@!$&\'()*+,;=]*)?/.test(
          v
        );
      },
      message: (props) => `${props.value} is not a valid !`,
    },
  },
  image2: {
    type: String,
    required: true,
    validate: {
      validator: function (v) {
        return /https?:\/\/(www\.)?[a-zA-Z0-9\-]+(\.[a-zA-Z]{2,})?([a-zA-Z0-9\-._~:\/?%#\[\]@!$&\'()*+,;=]*)?/.test(
          v
        );
      },
      message: (props) => `${props.value} is not a valid !`,
    },
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: true,
  },
  likes: {
    type: [{
      _id: String,
      name: String,
      about: String,
      avatar: String,
      email: String
  }],
    default: [],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("card", cardSchema);
