const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs")
require("dotenv").config();
const path = require("path");
const fs = require("fs/promises");
const gravatar = require("gravatar");
const Jimp = require("jimp");
const { nanoid } = require("nanoid");

const { JWT_SECRET } = process.env;

const {
  User,
  joiRegisterSchema,
  joiLoginSchema,
  joiSubscriptionSchema,
  joiEmailSchema,
} = require("../models/user");
const sendEmail = require("../helpers/sendEmail");

const verificationRequest = async (req, res) => {
  const { verificationToken } = req.params;
  const user = await User.findOne({ verificationToken });
  if (!user) {
    throw res.status(404).json({ message: "User not found" });
  }
  await User.findByIdAndUpdate(user._id, {
    verify: true,
    verificationToken: "",
  });
  res.json({ message: "Verification successful" });
};

const resendVerifyEmail = async (req, res) => {
  const { email } = req.body;
  const { error } = joiEmailSchema.validate(req.body);
  if (error) {
    throw res.status(400).json({ message: "missing required field email" });
  }
  
  const user = await User.findOne({ email });

  if (!user) {
    throw res.status(404).json({ message: "User not found" });
  }
  if (user.verify) {
    throw res
      .status(400)
      .json({ message: "Verification has already been passed" });
  }
  const mail = {
    to: email,
    subject: "verify your email",
    html: `<a href="http://localhost:3000/api/users/verify/${user.verificationToken}" target="_blank">Press to confirm</a>`,
  };
  await sendEmail(mail);
  res.json({ message: "Verification email sent" });
};

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

  const avatarURL = gravatar.url(email);
  const verificationToken = nanoid();

  const newUser = User.create({
    password: hashPassword,
    email,
    subscription,
    avatarURL,
    verificationToken,
  });

  const mail = {
    to: email,
    subject: "verify your email",
    html: `<a href="http://localhost:3000/api/users/verify/${verificationToken}" target="_blank">Press to confirm</a>`,
  };

  await sendEmail(mail);

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
    res.status(401).json({ message: "Email or password is wrong" });
  }
  const passwordCompare = bcrypt.compare(password, candidate.password);
  if (!passwordCompare) {
    throw res.status(401).json({ message: "Email or password is wrong" });
  }
  if (!candidate.verify) {
    throw res
      .status(401)
      .json({ message: "Email is not verified! Please check your mail box" });
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
  const { _id } = req.user;
  const avatarsDir = path.resolve(__dirname, "../public/avatars");
  console.log({ tmpPath, avatarsDir });
  const resultUpload = path.resolve(avatarsDir, `${_id}_${originalname}`);
  try {
    await Jimp.read(tmpPath)
      .then((img) => {
        return img
          .resize(256, 256) // resize
          .write(resultUpload); // save
      })
      .catch((err) => {
        console.error(err);
      });
    await fs.rename(tmpPath, resultUpload);
    const avatarURL = path.join("public", "avatars", originalname);
    await User.findByIdAndUpdate(_id, { avatarURL });
    return res.json({ status: "success", code: 200, data: avatarURL });
  } catch (error) {
    await fs.unlink(tmpPath);
    throw error;
  }
};

module.exports = {
  register,
  login,
  getCurrent,
  logout,
  updateSubscriptionStatus,
  uploadAvatar,
  verificationRequest,
  resendVerifyEmail,
};
