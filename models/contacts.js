const fs = require("fs/promises");
const path = require("path");

const { nanoid } = require("nanoid");

const contactsPath = path.resolve(__dirname, "contacts.json");

const listContacts = async () => {
  const data = await fs.readFile(contactsPath);
  const list = JSON.parse(data);
  return list;
};

const getContactById = async (contactId) => {
  const contacts = await listContacts();
  const contact = contacts.find((item) => item.id == contactId);
  return contact;
};

const removeContact = async (contactId) => {
  const contacts = await listContacts();
  const newContactsList = contacts.filter((contact) => contact.id != contactId);
  await fs.writeFile(contactsPath, JSON.stringify(newContactsList));
};

const addContact = async ({ name, email, phone }) => {
  const contacts = await listContacts();
  const id = nanoid();
  const newContact = { id, name, email, phone };
  const contactsList = JSON.stringify([...contacts, newContact], null, "\t");
  await fs.writeFile(contactsPath, contactsList);
  return newContact;
};

const updateContact = async (contactId, body) => {
  const contacts = await listContacts();
  const idx = contacts.findIndex((item) => item.id === contactId);
  if (idx === -1) null;
  contacts[idx] = { ...body, contactId };
  await fs.writeFile(contactsPath, JSON.stringify(contacts));
  return contacts[idx];
};

module.exports = {
  listContacts,
  getContactById,
  removeContact,
  addContact,
  updateContact,
};
