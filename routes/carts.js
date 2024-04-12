const router = require("express").Router();
const path = require("path");
const { celebrate, Joi } = require("celebrate");
const validator = require("validator");

const {
  addToCart,
  updateCart,
  removeFromCart,
  getCartData,
  subtractFromCartQuantity
} = require("../controllers/carts");

const authHeaderSchema = Joi.object({
  authorization: Joi.string().required(),
}).unknown(true);

router.post("/:cardId/quantity",celebrate({// agrega productos
  params: {
    cardId: Joi.string().required()
  },
}), addToCart);

router.get("/", celebrate({//obtiene el carrito donde estan todos los productos del usuario
  headers: authHeaderSchema
}), getCartData);




router.delete("/:cardId/quantity",celebrate({//elimina cantidad a comprar de producto
  params: {
    cardId: Joi.string().required()
  },
  headers: authHeaderSchema,
}), subtractFromCartQuantity);






// router.post("/:cardId/quantity",celebrate({//actualiza cantidad a comprar de cada producto
//   body: Joi.object().keys({
//     quantity: Joi.number().integer().min(1).max(30).required(),
//     headers: authHeaderSchema,
//   }),
//   params: Joi.object().keys({
//     cardId: Joi.string().alphanum().length(24).required(),
//   }),
//   headers: authHeaderSchema,
// }), updateCart);

// router.delete("/:cardId/product", celebrate({//elimina productos del carrito
//   params: Joi.object().keys({
//     cardId: Joi.string().alphanum().length(24).required(),
//     headers: authHeaderSchema,
//   }),
//   headers: authHeaderSchema,
// }), removeFromCart);


module.exports = router;