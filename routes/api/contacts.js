const router = require("express").Router()

const {
  listContacts,
  getContactById,
  removeContact,
  addContact,
  updateContact,
  updateStatusContact
} = require("../../controllers/contactsControllers");
const auth = require('../../middlewares/auth')

const isValidId = require("../../middlewares/isValidId");

router.get("/", auth, listContacts);

router.get("/:contactId", isValidId, getContactById);

router.post("/", auth, addContact);

router.delete("/:contactId", auth, isValidId, removeContact);

router.put("/:contactId", auth, isValidId, updateContact);

router.patch("/:contactId/favorite", auth, isValidId, updateStatusContact);

module.exports = router;
