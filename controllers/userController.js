const userModel = require("../models/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");

const registerUser = async (req, res) => {
  try {
    let reqBody = req.body;
    const { email, firstName, lastName, password, confirm_password, phone } =
      reqBody;
    const isEmailExists = await userModel.findOne({
      email: email,
    });

    if (isEmailExists) {
      res.status(400).send({
        success: false,
        message: "Email Already Exists!!",
      });
    } else {
      if (
        firstName &&
        lastName &&
        email &&
        password &&
        confirm_password &&
        phone
      ) {
        if (password === confirm_password) {
          // console.log("registerUser", reqBody);
          const salt = await bcrypt.genSalt(10);
          const hashedPassword = await bcrypt.hash(password, salt);

          const usercreated = await userModel.create({
            firstName: firstName,
            lastName: lastName,
            email: email,
            password: hashedPassword,
            phone: phone,
          });

          const dbJustCreatedUser = await userModel.findOne({ email: email });

          const token = jwt.sign(
            { userId: dbJustCreatedUser._id },
            process.env.JWT_SECURE_KEY,
            { expiresIn: "5d" }
          );
          res.status(201).send({
            success: true,
            message: "User created successfully!",
            user: usercreated,
            token: token,
          });
        } else {
          res.send({
            status: "failed",
            message: "Password and confirm password doesn't match",
          });
        }
      } else {
        res.send({
          status: "failed",
          message: "Provide all fields",
        });
      }
    }
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error got register user",
    });
  }
};

const loginUser = async (req, res) => {
  try {
    const reqBody = req.body;
    const { email, password } = reqBody;
    console.log(req.body);

    if (email && password) {
      const isUser = await userModel.find({
        email: email,
      });

      console.log("isUser", isUser);

      if (isUser[0] !== null) {
        const passwordMatch = await bcrypt.compare(
          password,
          isUser[0].password
        );
        console.log("passwordMatch", passwordMatch);
        if (isUser[0].email === email && passwordMatch) {
          const token = jwt.sign(
            { userId: isUser[0]._id },
            process.env.JWT_SECURE_KEY,
            { expiresIn: "5d" }
          );

          res.status(200).send({
            success: true,
            message: "user logged in success",
            token: token,
          });
        } else {
          res.send({
            status: "failed",
            message: "Email or password is not valid",
          });
        }
      } else {
        res.send({
          status: "failed",
          message: "User not valid",
        });
      }
    } else {
      res.send({
        status: "failed",
        message: "Provide all fields",
      });
    }
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error getting loged in user",
    });
  }
};

const changePassword = async (req, res) => {
  try {
    const { newPassword, confNewPassword } = req.body;
    if (newPassword && confNewPassword) {
      if (newPassword !== confNewPassword) {
        res.send({
          status: "failed",
          message: "New password and confirm new password doesn't match",
        });
      } else {
        const salt = await bcrypt.genSalt(10);
        const hashNewPassword = await bcrypt.hash(newPassword, salt);
        console.log(req.user);
        console.log(confNewPassword);
        const updatePasswordRes = await userModel.findByIdAndUpdate(
          req.user._id,
          {
            $set: newPassword,
          }
        );
        res.send({
          success: true,
          message: "Password change success",
          data: updatePasswordRes,
        });
      }
    } else {
      res.send({
        status: "failed",
        message: "All fields are required",
      });
    }
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error getting for change password",
    });
  }
};

const loggedUser = async (req, res) => {
  res.send({ user: req.user });
};

const resetUserPassword = async (req, res) => {
  const { email } = req.body;

  if (email) {
    try {
      const [isUser] = await userModel.find({ email: email });
      if (isUser) {
        console.log(isUser);
        const secret = isUser._id + process.env.JWT_SECURE_KEY;

        const token = await jwt.sign({ userId: isUser._id }, secret, {
          expiresIn: "10m",
        });

        const link = `http://127.0.0.1:3000/api/user/reset/${isUser._id}/${token}`;
        console.log("link", link);

        let transporter = nodemailer.createTransport({
          service: "gmail",
          auth: {
            user: "pankajmadhikar308@gmail.com",
            pass: "googleshorttimepassgenerated",
          },
        });
        // console.log("transporter", transporter);
        // console.log("email", email);
        let info = await transporter.sendMail({
          from: "pankajmadhikar308@gmail.com", // sender address
          to: email, // list of receivers
          subject: "Reset password", // Subject line
          text: "Hello world", // plain text body
          html: `<a href=${link}>Click here</a> to reset password`, // html body
        });

        // console.log("Info:", info);

        res.send({
          status: "success",
          message: `password reset link send. Please check your email`,
        });
      } else {
        res.send({
          success: false,
          message: "User not found",
        });
      }
    } catch (error) {
      console.log(error);
      res.status(500).send({
        success: false,
        message: "Error got reset user password",
      });
    }
  } else {
    res.send({
      success: false,
      message: "Provide all fields",
    });
  }
};

const userEmailLinkresetPasswod = async (req, res) => {
  const { password, confirm_password } = req.body;
  if (password && confirm_password) {
    const { id, token } = req.params;
    if (id) {
      const isUser = await userModel.findById(id);
      if (isUser) {
        const new_secret = isUser._id + process.env.JWT_SECURE_KEY;
        try {
          if (password !== confirm_password) {
            res.send({
              status: "failed",
              message: "Password not match",
            });
          } else {
            jwt.verify(token, new_secret);
            const salt = await bcrypt.genSalt(10);
            const hashPassword = await bcrypt.hash(password, salt);
            await userModel.findByIdAndUpdate(isUser._id, {
              $set: {
                password: hashPassword,
              },
            });

            res.send({
              status: "success",
              message: "Password reset success",
            });
          }
        } catch (error) {
          res.send({
            status: "failed",
            message: "Error got reset password",
          });
        }
      } else {
        res.send({
          status: "failed",
          message: "User not found",
        });
      }
    } else {
      res.send({
        status: "failed",
        message: "user id not valid",
      });
    }
  } else {
    res.send({
      status: "failed",
      message: "Provide all fields",
    });
  }
};

const getAllUser = async (req, res) => {
  try {
    const usersData = await userModel.find();
    res.status(200).send({
      success: true,
      message: "got all users",
      data: usersData,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error getting all users",
    });
  }
};

const getSingleUser = async (req, res) => {
  try {
    const user = await userModel.findById(req.params.id);
    res.status(200).send({
      success: true,
      message: "got single user",
      data: user,
    });
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error getting single user",
    });
  }
};

const updateUser = async (req, res) => {
  console.log(" req.params.id", req.params.id);
  console.log(" req.body", req.body);
  try {
    const isUserId = req.params.id;

    if (isUserId) {
      // res.status(404).send({
      //   success: false,
      //   message: "user not found",
      // });

      const response = await userModel.findByIdAndUpdate(isUserId, {
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        password: req.body.password,
        phone: req.body.phone,
      });
      console.log("response", response);
      res.status(200).send({
        success: true,
        message: "user update success",
        data: response,
      });
    }
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "Error update user",
    });
  }
};

const deleteUser = async (req, res) => {
  console.log("req.params.id delete", req.params.id);
  try {
    // const userId = new ObjectId(req.params.id);

    // const filter = { _id: userId };

    const isUser = await userModel.findById(req.params.id);
    if (isUser) {
      const result = await userModel.deleteOne({ _id: req.params.id });
      console.log("result", result);
      res.status(200).send({
        success: true,
        message: "user delete success",
        data: result,
      });
    } else {
      res.status(404).send({
        success: false,
        message: "user not fond",
      });
    }
  } catch (error) {
    res.status(500).send({
      success: false,
      message: "user delete error",
    });
  }
};

module.exports = {
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
};
