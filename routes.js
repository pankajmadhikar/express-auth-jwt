const userRouter = require("./routes/userRoute");

const setuproutes = (app) => {
  app.use("/api/user", userRouter);
};

module.exports = setuproutes;
