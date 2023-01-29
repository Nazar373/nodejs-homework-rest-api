const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
require("dotenv").config();
const multer = require("multer");
const path = require("path");
const fs = require("fs/promises");
const gravatar = require('gravatar');
const Jimp = require('jimp');

const { JWT_SECRET } = process.env;
const {
  User,
  joiRegisterSchema,
  joiLoginSchema,
  joiSubscriptionSchema,
} = require("../models/user");

const register = async (req, res) => {
  const { password, email, subscription } = req.body;
  const { error } = joiRegisterSchema.validate(req.body);
  if (error) {
    throw res.status(400).json({ message: "missing required field" });
  }

  const candidate = await User.findOne({ email });
  if (candidate) {
    return res
      .status(400)
      .json({ message: `user with email ${email} is already registered` });
  }

  const salt = await bcrypt.genSalt();
  const hashPassword = await bcrypt.hash(password, salt);

  const avatarURL = gravatar.url(email)

  const newUser = User.create({
    password: hashPassword,
    email,
    subscription,
    avatarURL
  });

  res.status(201).json({
    status: "success",
    code: 201,
    data: newUser,
  });
};

const login = async (req, res) => {
  const { email, password } = req.body;

  const { error } = joiLoginSchema.validate(req.body);
  if (error) {
    throw res.status(400).json({ message: "missing required field" });
  }

  const candidate = await User.findOne({ email });
  if (!candidate) {
    res.status(400).json({ message: "Email or password is wrong" });
  }
  const passwordCompare = bcrypt.compare(password, candidate.password);
  if (!passwordCompare) {
    throw res.status(400).json({ message: "Email or password is wrong" });
  }

  const payload = { id: candidate._id };
  const token = jwt.sign(payload, JWT_SECRET, {
    expiresIn: "1h",
  });
  await User.findByIdAndUpdate(candidate._id, { token });
  res.json({ status: "success", code: 200, data: { token, user: candidate } });
};

const getCurrent = async (req, res) => {
  const { email, subscription } = req.user;
  try {
    res.json({ status: "success", responsebody: { email, subscription } });
  } catch (error) {
    res.status(401).json({ message: "Not authorized" });
  }
};

const logout = async (req, res) => {
  const { _id } = req.user;
  await User.findByIdAndUpdate(_id, { token: null });
  res.status(204).json();
};

const updateSubscriptionStatus = async (req, res) => {
  const { _id } = req.user;

  const { error } = joiSubscriptionSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      message:
        "Subscription must have one of the following values ['starter', 'pro', 'business']",
    });
  }
  const updated = await User.findByIdAndUpdate(_id, req.body, {
    new: true,
  });
  res.status(201).json({ status: "success", code: 201, data: updated });
};

const uploadAvatar = async (req, res) => {
  const { path: tmpPath, originalname } = req.file;
  const { _id } = req.user
  const avatarsDir = path.resolve(__dirname, "../public/avatars");
  console.log({tmpPath, avatarsDir})
  const resultUpload = path.resolve(avatarsDir, `${_id}_${originalname}`);
  try {
    await Jimp.read(tmpPath).then(img => {
      return img
        .resize(256, 256) // resize
        .write(resultUpload); // save
    })
    .catch(err => {
      console.error(err);
    });
    await fs.rename(tmpPath, resultUpload);
    const avatarURL = path.join("public", "avatars", originalname);
    await User.findByIdAndUpdate(_id, {avatarURL})
    return res.json({status: "success", code: 200, data: avatarURL})
  } catch (error) {
      await fs.unlink(tmpPath);
      throw error
  }
};

module.exports = {
  register,
  login,
  getCurrent,
  logout,
  updateSubscriptionStatus,
  uploadAvatar,
};
