const cartModel = require("../models/cart");
const { HttpStatus, HttpResponseMessage } = require("../enums/http");

exports.addToCart = async (req, res, next) => {
  try {
    const {cardId} = req.params;
    const userId = req.user._id;
      let cart = await cartModel.findOne({ userId });//populate para extraer los datos del producto

      if (!cart) {// Si no existe un carrito para este usuario, lo creamos
      cart = new cartModel ({ userId, products: [] });
    }
    const productIndex = cart.products.findIndex(product => product.cardId._id.toString() === cardId);// Verificamos si el producto ya está en el carrito
    if (productIndex !== -1) {// Si el producto ya está en el carrito, actualizamos la cantidad
      cart.products[productIndex].quantity += 1;
    } else {

      cart.products.push({ cardId, quantity:1 });// Si el producto no está en el carrito, lo agregamos

    }
    await cart.save();


    res.send({ data: cart });
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(HttpStatus.BAD_REQUEST).send({ error: "se pasaron datos invalidos al agregar un producto" });
    }
    next(error);
  }
};

exports.subtractFromCartQuantity = async (req, res, next) => {
  try {
    const { cardId} = req.params;
    const userId = req.user._id;
    console.log("infomacion del Id");
    console.log(cardId);
    let cart = await cartModel.findOne({ userId });

    if (!cart) {
      return res.status(HttpStatus.NOT_FOUND).send({ error: "No se encontró el carrito para este usuario" });
    }

    const productIndex = cart.products.findIndex(product => product.cardId._id.toString() === cardId);

    if (productIndex !== -1) {
      cart.products[productIndex].quantity -= 1;

      // Si la cantidad después de restar es menor o igual a cero, eliminar el producto del carrito
      if (cart.products[productIndex].quantity <= 0) {
        cart.products.splice(productIndex, 1);
      }

      await cart.save();
      res.send({ message: "Cantidad del producto actualizada exitosamente en el carrito" });
    } else {
      res.status(HttpStatus.NOT_FOUND).send({ error: "El producto no está en el carrito" });
    }
  } catch (error) {
    next(error);
  }
};

// Controlador para obtener los datos del carrito y la información del producto asociado
exports.getCartData =  async  (req, res, next) => {
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
};



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
// exports.removeFromCart = async (req, res) => {
//   try {
//     const cardId = req.params.cardId;
//     const userId = req.user._id;

//     let cart = await cartModel.findOne({ userId });

//     if (!cart) {
//       return res.status(HttpStatus.BAD_REQUEST).json({ error: 'Carrito no encontrado' });
//     }

//     const productIndex = cart.products.findIndex(product => product.cardId.toString() === cardId);

//     if (productIndex !== -1) {
//       // Si el producto está en el carrito, lo eliminamos
//       cart.products.splice(productIndex, 1);
//       await cart.save();
//       res.status(200).json(cart);
//     } else {
//       // Si el producto no está en el carrito, devolvemos un error
//       res.status(HttpStatus.BAD_REQUEST).json({ error: 'Producto no encontrado en el carrito' });
//     }
//   }catch (error) {
//     if (error.name === "ValidationError") {
//       return res.status(HttpStatus.BAD_REQUEST).send({ error: "se pasaron datos invalidos al eliminar un producto" });
//     }
//     next(error);
//   }
// };