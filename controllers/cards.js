const cardModel = require("../models/card");
const { HttpStatus, HttpResponseMessage } = require("../enums/http");

module.exports.getCards = async (req, res, next) => {
  try {
    const cards = await cardModel.find({}).orFail();
    res.send({ data: cards });
  } catch (error) {
    if (error.name === "DocumentNotFoundError") {
      return res.status(HttpStatus.NOT_FOUND).send({ error: "No se encontraron tarjetas." });
    }
    next(error);
  }
};

module.exports.createCard = async (req, res, next) => {
  try {
    const { name, priceNormal, price, stock, link, image2 } = req.body;
    const owner = req.user._id;
    const newCard = await cardModel.create({ name, priceNormal, price, stock, link,image2, owner });
    res.send({ data: newCard });
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(HttpStatus.BAD_REQUEST).send({ error: "se pasaron datos invalidos al crear una card" });
    }
    next(error);
  }
};

module.exports.searchCardByName = async (req, res, next) => {
  try {
    const { name } = req.params; 
    if (!name) {
      return res.status(HttpStatus.BAD_REQUEST).send({ error: "Se requiere proporcionar un nombre para buscar." });
    }
    const card = await cardModel.find({ name: { $regex: new RegExp(name, "i") } }).orFail();//se busca de manera insensible a mayusculas y min
    res.send({ data: card});
  } catch (error) {
    if (error.name === "DocumentNotFoundError") {
      return res.status(HttpStatus.NOT_FOUND).send({ error: "No se encontraron tarjetas con el nombre especificado." });
    }
    next(error);
  }
};


module.exports.deleteCard = async (req, res, next) => {
  console.log(req.params.cardId);
  try {
    const cardId = req.params.cardId;
    const userId = req.user._id;

    const card = await cardModel.findById(cardId);
    if (!card) {
      return res.status(HttpStatus.NOT_FOUND).send({ message: "La tarjeta no existe" });
    }
    if (card.owner.toString() !== userId) {
      return res.status(HttpStatus.FORBIDDEN).json({ message: "No tienes permiso para borrar esta tarjeta" });
    }
    await cardModel.findByIdAndDelete(cardId);
    res.status(HttpStatus.OK).json({ message: "Tarjeta eliminada correctamente" });
  } catch (error) {
    next(error);
  }
};
module.exports.likeCard = async (req, res, next) => {
  const { _id, name, about, avatar, email } = req.body;
  try {
    const updatedCard = await cardModel.findByIdAndUpdate(
      req.params.cardId,
      { $addToSet: { likes: {_id, name, about, avatar, email }} },
      { new: true }
    );
    res.send({ data: updatedCard });
  } catch (error) {
    next(error);
  }
};
module.exports.dislikeCard = async (req, res, next) => {
  const cardId = req.params.cardId;
  const _id = req.user._id;
  try {
    const updatedCard = await cardModel.findByIdAndUpdate(
      cardId,
      { $pull: { likes: { _id: _id }} },
      { new: true }
    );
    if (!updatedCard) {
      return res.status(HttpStatus.NOT_FOUND).send({ error: 'Tarjeta no encontrada' });
    }
    res.send ({ data: updatedCard });
  } catch (error) {
    next(error);
  }
};
