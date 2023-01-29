const router = require("express").Router();

const {
  register,
  login,
  getCurrent,
  logout,
  updateSubscriptionStatus,
  uploadAvatar,
} = require("../../controllers/authController");
const auth = require("../../middlewares/auth");
const upload = require("../../middlewares/multer")

router.post("/register", register);
router.post("/login", login);

router.get("/current", auth, getCurrent);
router.post("/logout", auth, logout);
router.patch("/", auth, updateSubscriptionStatus);

router.patch("/avatars", auth, upload.single("avatar"), uploadAvatar);

module.exports = router;
