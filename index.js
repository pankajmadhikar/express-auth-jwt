const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const router = require("./routes/userRoute");
const setuproutes = require("./routes");
// dot env configuration
dotenv.config();
// dotenv.config({ path: "./" });

// connect DB
connectDB();

// Rest Object
const app = express();

// Middlewares
// Cors Policy
app.use(cors());

// Json
app.use(express.json());
app.use(morgan("dev"));

// Load Routes
setuproutes(app);

app.get("/", (req, res) => {
  res.status(200).send("<h1>Hello backend home</h1>");
});

// PORT
const PORT = process.env.PORT || 8080;

app.use("/*", (req, res) => {
  res.status(404).send({
    status: false,
    message: "you are in wrong path",
  });
});

app.listen(PORT, () => {
  console.log("App running on PORT", PORT);
});
