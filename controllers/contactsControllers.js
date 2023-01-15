const Contact = require("../models/contact");

const listContacts = async () => {
  const contacts = await Contact.find();
  return contacts;
};

const getContactById = async (contactId) => {
  const contact = await Contact.findById(contactId);
  if(!contact) throw "not"
  return contact;
};

const removeContact = async (contactId) => {
  const deleteContact = await Contact.findByIdAndRemove({ _id: contactId });
  return deleteContact;
};

const addContact = async ({ name, email, phone }) => {
  const newContact = await Contact.create({
    name,
    phone,
    email,
  });
  return newContact;
};

const updateContact = async (contactId, body) => {
  const updateContact = await Contact.findByIdAndUpdate(
    { _id: contactId },
    body,
    { new: true }
  );
  return updateContact;
};

const updateStatusContact = async(contactId, body) => {
  const updateContact = await Contact.findByIdAndUpdate(
    { _id: contactId },
    body,
    { new: true }
  );
  return updateContact;
}
module.exports = {
  listContacts,
  getContactById,
  removeContact,
  addContact,
  updateContact,
  updateStatusContact
};
