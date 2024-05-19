const router = require("express").Router();
const path = require("path");
const { celebrate, Joi } = require("celebrate");
const validator = require("validator");
const {
  getCurrentUser,
  getUsers,
  getUser,
  addToCart,
  getCartProducts,
  subtractFromCartQuantity,
  addToFavorites,
  getProductsFavorites,
  removeFromFavorites
} = require("../controllers/users");

const validateURL = (value, helpers) => {
  if (validator.isURL(value)) {
    return value;
  }
  return helpers.error("string.uri");
};

const authHeaderSchema = Joi.object({
  authorization: Joi.string().required(),
}).unknown(true);

router.get("/me", celebrate({
    headers: authHeaderSchema,
  }),
  getCurrentUser
);
router.get("/", celebrate({
    headers: authHeaderSchema,
  }),
  getUsers
);
router.get("/:userId", celebrate({
    params: Joi.object().keys({
      userId: Joi.string().alphanum().length(24).required(),
    }),
    headers: authHeaderSchema,
  }),
  getUser
);
// carrito de compras
router.post("/:productId/add-to-cart", celebrate({

  params: Joi.object().keys({
    productId: Joi.string().alphanum().length(24).required(),
  }),
  body: Joi.object().keys({
    productName: Joi.string().required(),
    imageUrl: Joi.string().required(),
    price: Joi.number().required(),
    stock: Joi.number().required(),
  }),
}), addToCart);

router.delete("/:productId/delete-to-cart", celebrate({
  params: Joi.object().keys({
    productId: Joi.string().alphanum().length(24).required(),
  }),
}), subtractFromCartQuantity );

router.get("/products/Cart", celebrate({
  headers: authHeaderSchema,
}), getCartProducts) ;

//favorites
router.post("/:productId/add-to-favorites", celebrate({
  params: Joi.object().keys({
    productId: Joi.string().alphanum().length(24).required(),
  }),
  body: Joi.object().keys({
    productName: Joi.string().required(),
    imageUrl: Joi.string().required(),
    price: Joi.number().required(),
    stock: Joi.number().required(),
  }),
}), addToFavorites);

router.get("/products/favorites", celebrate({
  headers: authHeaderSchema,
}), getProductsFavorites) ;

router.delete("/:productId/remove-to-favorites", celebrate({
  params: Joi.object().keys({
    productId: Joi.string().alphanum().length(24).required(),
  }),

}), removeFromFavorites) ;







module.exports = router;
