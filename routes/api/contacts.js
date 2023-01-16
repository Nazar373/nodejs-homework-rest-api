const express = require("express");
const Joi = require("joi");

const router = express.Router();

const {
  listContacts,
  getContactById,
  removeContact,
  addContact,
  updateContact,
  updateStatusContact
} = require("../../controllers/contactsControllers");

const isValidId = require("../../middlewares/isValidId");

const schema = Joi.object({
  name: Joi.string().required().min(3).max(30),
  email: Joi.string()
    .required()
    .email({ minDomainSegments: 2, tlds: { allow: ["com", "net"] } }),
  phone: Joi.string().required(),
  favorite: Joi.boolean(),
});

const updateFavoriteSchema = Joi.object({
  favorite: Joi.boolean().required(),
});

router.get("/", async (req, res, next) => {
  try {
    const contacts = await listContacts();
    console.log(contacts);
    res.json({
      status: "success",
      code: 200,
      data: { result: contacts },
    });
  } catch (error) {
    next(error);
  }
});

router.get("/:contactId", isValidId, async (req, res, next) => {
  try {
    const { contactId } = req.params;
    const result = await getContactById(contactId);
    if (!result) {
      const error = new Error(`Contact with id "${contactId}" not found`);
      error.status = 404;
      throw error;
    }
    res.json({
      status: "success",
      code: 200,
      data: { result },
    });
  } catch (error) {
    next(error);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const { error } = schema.validate(req.body);
    if (error) {
      throw res.status(400).json({ message: "missing required field" });
    }
    const result = await addContact(req.body);
    res.status(201).json({
      status: "success",
      code: 201,
      data: { result },
    });
  } catch (error) {
    next(error);
  }
});

router.delete("/:contactId", isValidId, async (req, res, next) => {
  try {
    const { contactId } = req.params;
    const result = await removeContact(contactId);
    if (!result) {
      const error = new Error(`Contact with id "${contactId}" not found`);
      error.status = 404;
      throw error;
    }
    res.json({
      status: "success",
      code: 200,
      message: "contact deleted",
      data: { result },
    });
  } catch (error) {}
});

router.put("/:contactId", isValidId, async (req, res, next) => {
  try {
    const { error } = schema.validate(req.body);
    if (error) {
      error.status = 400;
      error.message = "missing fields";
      throw error;
    }
    const { contactId } = req.params;
    const result = await updateContact(contactId, req.body);
    if (!result) {
      const error = new Error(`Contact with id "${contactId}" not found`);
      error.status = 404;
      throw error;
    }
    res.json({
      status: "success",
      code: 201,
      data: { result },
    });
  } catch (error) {
    next(error);
  }
});

router.patch(
  "/:contactId/favorite",
  isValidId,
  async (req, res, next) => {
    try {
      const { error } = updateFavoriteSchema.validate(req.body);
      if (error) {
        error.status = 400;
        error.message = "missing field favorite";
        throw error;
      }
      const { contactId } = req.params;
      const result = await updateStatusContact(contactId, req.body);
      if (!result) {
        const error = new Error(`Contact with id "${contactId}" not found`);
        error.status = 404;
        throw error;
      }
      res.json({
        status: "success",
        code: 201,
        data: { result },
      });
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
