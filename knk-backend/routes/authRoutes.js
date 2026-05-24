const express = require("express");
const router = express.Router();

const { registerUser, loginUser, getAllUsers, } = require("../controllers/authController");
const { protect, adminOnly } = require("../middlewares/authMiddleware");


router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/users", protect, adminOnly, getAllUsers);

module.exports = router;