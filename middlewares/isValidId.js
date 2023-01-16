const { isValidObjectId } = require("mongoose");

const isValidId = (req, res, next) => {
  console.log('req:', req.params)
  const {contactId} = req.params;
  if(!isValidObjectId(contactId)) {
    const error = res.status(400).json({message: `${contactId} is not correct id format`});
    next(error)
  }
  next()
}

module.exports = isValidId;