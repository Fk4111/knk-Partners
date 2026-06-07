const express = require("express");
const router = express.Router();

const { registerUser, loginUser, getAllUsers, getProfile,
  changePassword, updateProfile, uploadAvatar, } = require("../controllers/authController");
const { protect, adminOnly } = require("../middlewares/authMiddleware");
const uploadAvatarMiddleware = require("../middlewares/uploadAvatar");




router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/users", protect, adminOnly, getAllUsers);
router.get(
  "/profile",
  protect,
  getProfile
);

router.patch(
  "/change-password",
  protect,
  changePassword
);


router.put(
  "/profile",
  protect,
  updateProfile
);

router.patch(
  "/avatar",
  protect,
  uploadAvatarMiddleware.single("avatar"),
  uploadAvatar
);

module.exports = router;