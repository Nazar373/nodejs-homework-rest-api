const router = require("express").Router();

const { register, login, getCurrent, logout, updateSubscriptionStatus} = require("../../controllers/authController");
const auth = require("../../middlewares/auth");

router.post("/register", register);
router.post("/login", login);

router.get("/current", auth, getCurrent);
router.post("/logout", auth, logout)
router.patch("/", auth, updateSubscriptionStatus)

module.exports = router;
