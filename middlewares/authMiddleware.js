const jwt = require("jsonwebtoken");
const userModel = require("../models/userModel");

const checkUserAuth = async (req, res, next) => {
  let token;
  const { authorization } = req.headers;
  // console.log("authorization", authorization);
  if (authorization && authorization.startsWith("Bearer")) {
    try {
      token = authorization.split(" ")[1];
      // Verify Token
      const { userId } = jwt.verify(token, process.env.JWT_SECURE_KEY);
      // Get user fromtoken
      // req.user = await userModel.findById(userId);

      //dont have password then apply these
      req.user = await userModel.findById(userId).select("-password");

      next();
    } catch (error) {
      res.status(401).send({
        success: false,
        message: "Unauthorized user",
      });
    }
  }

  if (!token) {
    res.send({
      status: "failed",
      message: "Unauthorized user, token failed",
    });
  }
};

module.exports = checkUserAuth;
