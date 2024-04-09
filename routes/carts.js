const router = require("express").Router();
const path = require("path");
const { celebrate, Joi } = require("celebrate");
const validator = require("validator");

const {
  addToCart,
  updateCart,
  removeFromCart,
  getCartData
} = require("../controllers/carts");

const authHeaderSchema = Joi.object({
  authorization: Joi.string().required(),
}).unknown(true);

router.post("/",celebrate({//crea un carrito para el usuario si no tiene uno y agrega productos al carrito
  body: Joi.object().keys({
    cardId: Joi.string().required(),
    quantity: Joi.number().integer().min(1).max(30).required(),
    headers: authHeaderSchema,
  })
}), addToCart);

router.get("/", celebrate({
  headers: authHeaderSchema
}), getCartData);

router.post("/:cardId/quantity",celebrate({//actualiza cantidad a comprar de cada producto
  body: Joi.object().keys({
    quantity: Joi.number().integer().min(1).max(30).required(),
    headers: authHeaderSchema,
  }),
  params: Joi.object().keys({
    cardId: Joi.string().alphanum().length(24).required(),
  }),
  headers: authHeaderSchema,
}), updateCart);

router.delete("/:cardId/product", celebrate({//elimina productos del carrito
  params: Joi.object().keys({
    cardId: Joi.string().alphanum().length(24).required(),
    headers: authHeaderSchema,
  }),
  headers: authHeaderSchema,
}), removeFromCart);


module.exports = router;