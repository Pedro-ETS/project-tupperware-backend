const router = require("express").Router();
const path = require("path");
const { celebrate, Joi } = require("celebrate");
const validator = require("validator");
const {
  getCurrentUser,
  getUsers,
  getUser,
  updateAvatar,
  updateProfile,
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
router.patch("/avatar", celebrate({
    body: Joi.object().keys({
      avatar: Joi.string().custom(validateURL),
    }),
    headers: Joi.object({
      authorization: Joi.string().required(),
    }).unknown(true),
  }),
  updateAvatar
);
router.patch("/me", celebrate({
    body: Joi.object().keys({
      name: Joi.string().min(2).max(30),
      about: Joi.string().min(2).max(30),
    }),
    headers: Joi.object({
      authorization: Joi.string().required(),
    }).unknown(true),
  }),
  updateProfile
);

module.exports = router;
