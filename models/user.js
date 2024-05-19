const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    minlength: 2,
    maxlength: 40,
    default: 'usuario indefinido'
  },
  address: {
    type: String,
    minlength: 2,
    maxlength: 50,
    default: 'sin direccion'
  },
  phone: {
    type: String,
    minlength: 10,
    maxlength: 13,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator: validator.isEmail,
      message: 'Formato de correo electrónico incorrecto'
    }
  },
  password: {
    type: String,
    required: true,
    minlength: 8,
    select: false
  },
  cart: [
    {
      productId: {
        type: String, // usamos el string ya que id lo proporcionamos nosotros y el ObjId nos lo genera MongooDB
        required: true
      },
      productName: {
        type: String,
        required: true
      },
      imageUrl: {
        type: String
      },
      stock:{
        type: Number,
        required: true
      },
      price: {
        type: Number,
        required: true
      },
      quantity: {
        type: Number,
        default: 0
      }
    }
  ],
  favorites: [
    {
      productId: {
        type: String, // usamos el string ya que id lo proporcionamos nosotros y el ObjId nos lo genera MongooDB
        required: true
      },
      productName: {
        type: String,
        required: true
      },
      imageUrl: {
        type: String
      },
      stock:{
        type: Number,
        required: true
      },
      price: {
        type: Number,
        required: true
      },
      quantity: {
        type: Number,
        default: 0
      }
    }
  ]
});

userSchema.statics.findUserByCredentials = function (email, password) {
  return this.findOne({ email }).select('+password')
    .then((user) => {
    if (!user) {
      return Promise.reject(new Error('Incorrect password or email'));
    }

    return bcrypt.compare(password, user.password)
      .then((matched) => {
      if (!matched) {
        return Promise.reject(new Error('Incorrect password or email'));
      }

      return user;
    });
  });
};

module.exports = mongoose.model("user", userSchema);
