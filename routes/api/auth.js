const router = require("express").Router();

const {
  register,
  login,
  getCurrent,
  logout,
  updateSubscriptionStatus,
  uploadAvatar,
  verificationRequest,
  resendVerifyEmail
} = require("../../controllers/authController");
const auth = require("../../middlewares/auth");
const upload = require("../../middlewares/multer")

router.post("/register", register);
router.post("/login", login);

router.get("/verify/:verificationToken", verificationRequest)
router.post("/verify", resendVerifyEmail)

router.get("/current", auth, getCurrent);
router.post("/logout", auth, logout);
router.patch("/", auth, updateSubscriptionStatus);

router.patch("/avatars", auth, upload.single("avatar"), uploadAvatar);

module.exports = router;
