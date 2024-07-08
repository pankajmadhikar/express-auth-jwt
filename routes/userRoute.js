const express = require("express");
const {
  registerUser,
  getAllUser,
  getSingleUser,
  updateUser,
  deleteUser,
  loginUser,
  changePassword,
  loggedUser,
  resetUserPassword,
  userEmailLinkresetPasswod,
} = require("../controllers/userController");
const checkUserAuth = require("../middlewares/authMiddleware");

const router = express.Router();

// Auth level middleware - To protect Route

router.post("/register-user", registerUser);
router.post("/logedin-user", loginUser);
router.post("/changePassword", checkUserAuth, changePassword);
router.get("/getloggeduser", checkUserAuth, loggedUser);
router.post("/send-reset-password-email", resetUserPassword);
router.post("/reset-password-by-email/:id/:token", userEmailLinkresetPasswod);

router.get("/get-all-user", getAllUser);
router.get("/:id", getSingleUser);
router.put("/update-user/:id", updateUser);
router.delete("/delete-user/:id", deleteUser);

module.exports = router;
