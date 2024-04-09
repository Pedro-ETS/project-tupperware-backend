const router = require("express").Router();
const path = require("path");
const { celebrate, Joi } = require("celebrate");
const validator = require("validator");
const {
  getCards,
  createCard,
  deleteCard,
  likeCard,
  dislikeCard,
} = require("../controllers/cards");

const validateURL = (value, helpers) => {
  if (validator.isURL(value)) {
    return value;
  }
  return helpers.error("string.uri");
};

const authHeaderSchema = Joi.object({
  authorization: Joi.string().required(),
}).unknown(true);

router.get("/", celebrate({
  headers: authHeaderSchema,
}), getCards);

router.post("/",celebrate({
  body: Joi.object().keys({
    name: Joi.string().min(2).required().max(50),
    price: Joi.string().min(2).max(10).required(),
    stock: Joi.string().min(1).max(5).required(),
    link: Joi.string().required().custom(validateURL),
    headers: authHeaderSchema,
  })
}), createCard);

router.put("/:cardId/likes", celebrate({
  params: Joi.object().keys({
    cardId: Joi.string().alphanum().length(24).required(),
  }),
  headers: authHeaderSchema,
}),likeCard);

router.delete("/:cardId/likes", celebrate({
  params: Joi.object().keys({
    cardId: Joi.string().alphanum().length(24).required(),
    headers: authHeaderSchema,
  }),
  headers: authHeaderSchema,
}), dislikeCard);
router.delete("/:cardId",celebrate({
  params: Joi.object().keys({
    cardId: Joi.string().alphanum().length(24).required(),
  }),
  headers: authHeaderSchema,
}), deleteCard);

module.exports = router;