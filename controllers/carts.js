const cartModel = require("../models/cart");
const { HttpStatus, HttpResponseMessage } = require("../enums/http");

exports.addToCart = async (req, res, next) => {
  try {
    const {cardId, quantity } = req.body;
    const userId = req.user._id;
      let cart = await cartModel.findOne({ userId }).populate('products.cardId');//populate para extraer los datos del producto
    if (!cart) {// Si no existe un carrito para este usuario, lo creamos
      cart = new cartModel ({ userId, products: [] });
    }
    const productIndex = cart.products.findIndex(product => product.cardId.toString() === cardId);// Verificamos si el producto ya está en el carrito
    if (productIndex !== -1) {
      // Si el producto ya está en el carrito, actualizamos la cantidad
      cart.products[productIndex].quantity += quantity;
    } else {
      // Si el producto no está en el carrito, lo agregamos
      cart.products.push({ cardId, quantity });
    }
    await cart.save();

    // Formateamos la respuesta para que sea consistente con el formato de getCartData
    const cartData = {
      userId: cart.userId,
      products: cart.products.map(product => ({
        product: {
          _id: product.cardId._id,
          name: product.cardId.name,
          price: product.cardId.price,
          stock: product.cardId.stock,
          // Agregar más campos según sea necesario
        },
        quantity: product.quantity
      }))
    };

    res.send({ data: cartData });
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(HttpStatus.BAD_REQUEST).send({ error: "se pasaron datos invalidos al agregar un producto" });
    }
    next(error);
  }
};

// Controlador para obtener los datos del carrito y la información del producto asociado
exports.getCartData =  async  (req, res,next) => {
  try {
      const userId = req.user._id;

      // Buscar el carrito del usuario en la base de datos
      const cart = await cartModel.findOne({ userId }).populate('products.cardId');

      if (!cart) {
        return res.status(HttpStatus.OK).json({ message: 'No hay elementos en el carrito para este usuario.' });
      }

      // Mapear los datos del carrito y los productos asociados
      const cartData = {
          userId: cart.userId,
          products: cart.products.map(product => ({
              product: {
                  _id: product.cardId._id,
                  name: product.cardId.name,
                  price: product.cardId.price,
                  stock: product.cardId.stock,
                  // Agregar más campos según sea necesario
              },
              quantity: product.quantity
          }))
      };

      // Enviar la respuesta con los datos del carrito y los productos asociados
      res.send({ data: cartData });
  }catch (error) {
    next(error);
  }
}



exports.updateCart = async (req, res, next) => {
  try {
    const { quantity } = req.body;
    const cardId = req.params.cardId;
    const userId = req.user._id;

    let cart = await cartModel.findOne({ userId });

    if (!cart) {
      return res.status(HttpStatus.NOT_FOUND).json({ error: 'Carrito no encontrado' });
    }

    const productIndex = cart.products.findIndex(product => product.cardId.toString() === cardId);

    if (productIndex !== -1) {// Si el producto está en el carrito, actualizamos la cantidad
      cart.products[productIndex].quantity = quantity;
      await cart.save();
      res.send({ data: cart });
    } else {// Si el producto no está en el carrito, devolvemos un error
      res.status(HttpStatus.NOT_FOUND).json({ error: 'Producto no encontrado en el carrito' });
    }
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(HttpStatus.BAD_REQUEST).send({ error: "se pasaron datos invalidos al actualizar un producto" });
    }
    next(error);
  }
};

// Controlador para eliminar un producto del carrito
exports.removeFromCart = async (req, res) => {
  try {
    const cardId = req.params.cardId;
    const userId = req.user._id;

    let cart = await cartModel.findOne({ userId });

    if (!cart) {
      return res.status(HttpStatus.BAD_REQUEST).json({ error: 'Carrito no encontrado' });
    }

    const productIndex = cart.products.findIndex(product => product.cardId.toString() === cardId);

    if (productIndex !== -1) {
      // Si el producto está en el carrito, lo eliminamos
      cart.products.splice(productIndex, 1);
      await cart.save();
      res.status(200).json(cart);
    } else {
      // Si el producto no está en el carrito, devolvemos un error
      res.status(HttpStatus.BAD_REQUEST).json({ error: 'Producto no encontrado en el carrito' });
    }
  }catch (error) {
    if (error.name === "ValidationError") {
      return res.status(HttpStatus.BAD_REQUEST).send({ error: "se pasaron datos invalidos al eliminar un producto" });
    }
    next(error);
  }
};