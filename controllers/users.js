const userModel = require("../models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { HttpStatus, HttpResponseMessage } = require("../enums/http");
require('dotenv').config();//-----
const { NODE_ENV, JWT_SECRET } = process.env;

module.exports.login = (req, res, next) => {
  const { email, password } = req.body;
  if (!password) {
    return res
      .status(HttpStatus.BAD_REQUEST)
      .send({ message: "La contraseña no está definida" });
  }
  return userModel
    .findUserByCredentials(email, password)
    .then((user) => {
      res.send({
        token: jwt.sign({ _id: user._id },NODE_ENV === 'production' ? JWT_SECRET : 'dev-secret', {
          expiresIn: "7d",
        }),
      });
    })
    .catch((err) => {
      next(err);
    });
};
module.exports.createUser = async (req, res, next ) => {
  try {
    const { name, address, phone, email, password } = req.body;
    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res
        .status(HttpStatus.CONFLICT)
        .send({ message: "El usuario ya existe" });f
    }

    const hash = await bcrypt.hash(password, 10);
    const user = await userModel.create({
      name,
      address,
      phone,
      email,
      password: hash,
    });

    res.status(HttpStatus.OK).send({
      _id: user._id,
      email: user.email,
    });
  } catch (err) {
    next(err);
  }
};
module.exports.getCurrentUser = async (req, res, next) => {
  try {
    const userId = req.user._id;
    console.log("id del usuario actual");
    console.log(userId);
    const user = await userModel.findById(userId);
    if (!user) {
      return res
        .status(HttpStatus.NOT_FOUND)
        .json({ message: "Usuario no encontrado" });
    }
    res.status(200).json(user);
  } catch (error) { 
    next(error);
  }
};

module.exports.getUsers = async (req, res, next) => {
  try {
    const usersData = await userModel.find({}).orFail();
    res.send({ data: usersData });
  } catch (error) {
    if (error.name === "DocumentNotFoundError") {
      return res
        .status(HttpStatus.NOT_FOUND)
        .send({ error: "No se encontraron usuarios." });
    }
    next(error);
  }
};
module.exports.getUser = async (req, res, next) => {
  try {
    const userData = await userModel.findById(req.params.userId).orFail();
    res.send({ userData });
  } catch (error) {
    if (error.name === "DocumentNotFoundError") {
      return res
        .status(HttpStatus.NOT_FOUND)
        .send({ error: "No se encontro el usuario" });
    } else if (error.name === "CastError") {
      return res
        .status(HttpStatus.BAD_REQUEST)
        .send({ error: "ID de usuario inválido." });
    }
    next(error);
  }
};
exports.addToCart = async (req, res, next) => {
  try {
    const {productId} = req.params;
    const {productName, price, stock}=req.body;
    const userId = req.user._id;
     const user = await userModel.findById(userId);
     if (!user) {
       return res.status(404).json({ message: "Usuario no encontrado" });
     }
      const existingProductIndex = user.cart.findIndex(item => item.productId === productId);
    if (existingProductIndex !== -1) {
      user.cart[existingProductIndex].quantity += 1;
    } else {

      user.cart.push({ productId, productName, stock, price, quantity: 1 });
    }
    await user.save();
    res.status(200).json({ message: "Producto agregado al carrito exitosamente" });
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(HttpStatus.BAD_REQUEST).send({ error: "se pasaron datos invalidos al agregar un producto" });
    }
    next(error);
  }
};

exports.getCartProducts = async (req, res, next) => {
  try {
    const userId = req.user._id;
    console.log("Id del usuario para obtener los productos del carrito");
    console.log(userId);
    const user = await userModel.findById(userId).select('cart');

    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }
    res.status(200).json({ data: user.cart });
  } catch (error) {
    next(error);
  }
};

exports.subtractFromCartQuantity = async (req, res, next) => {
  try {
    const {productId} = req.params;

    const userId = req.user._id;
     const user = await userModel.findById(userId);
     if (!user) {
       return res.status(404).json({ message: "Usuario no encontrado" });
     }
      const existingProductIndex = user.cart.findIndex(item => item.productId === productId);// Verificamos si el producto ya está en el carrito

    if (existingProductIndex !== -1) {// Si el producto ya está en el carrito, actualizamos la cantidad
      user.cart[existingProductIndex].quantity -= 1;

      if (user.cart[existingProductIndex].quantity <= 0) {
        user.cart.splice(existingProductIndex, 1);
      }
      await user.save();
      res.send({ message: "Cantidad del producto actualizada exitosamente en el carrito" });

    } else {
      res.status(HttpStatus.NOT_FOUND).send({ error: "El producto no está en el carrito" });
    }

  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(HttpStatus.BAD_REQUEST).send({ error: "se pasaron datos invalidos al agregar un producto" });
    }
    next(error);
  }
};
exports.addToFavorites = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const { productName, price, stock } = req.body;
    const userId = req.user._id;
    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(HttpStatus.BAD_REQUEST).json({ error: "Usuario no encontrado" });
    }
    const isProductInFavorites = user.favorites.some(item => item.productId === productId);
    if (isProductInFavorites) {
      return  res.status(HttpStatus.BAD_REQUEST).send({ error: "El producto ya está en favoritos" });
    }
    user.favorites.push({ productId, productName, stock, price });
    await user.save();
    res.status(200).json({ message: "Producto agregado a favoritos exitosamente" });
  } catch (error) {
    console.error("Error al agregar producto a favoritos:", error);
    next(error);
  }
};
exports.getProductsFavorites = async (req, res, next) => {
  try {
    const userId = req.user._id;
    console.log("Id del usuario para obtener los productos del carrito");
    console.log(userId);
    const user = await userModel.findById(userId).select('favorites');

    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }
    res.status(200).json({ data: user.favorites });
  } catch (error) {
    next(error);
  }
};