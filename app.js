require("dotenv").config();
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const mongoose = require("mongoose");
const decodeIDToken = require("./middlewares/authenticateToken");

// Import routers
const debugRouter = require("./routes/debug");
const { connectDiscord } = require("./discord");
const userRouter = require("./routes/user");

const PORT = process.env.PORT || 5000;
const app = express();

var corsOption = {
  origin: [`${process.env.FRONT_END_URL}`],
  optionsSuccessStatus: 200,
  cookie: {
    httpOnly: true,
  },
};

// Load Mongoose
mongoose
  .connect(
    `mongodb+srv://admin:${process.env.DB_PASS}@2bdb.nvw2c.mongodb.net/?retryWrites=true&w=majority`,
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  )
  .then(() => console.log("Successfully connected to MongoDB"))
  .catch((err) =>
    console.log(
      `Errors have been occured while trying to connect to Mongo DB | ${err}`
    )
  );

// Start the discord bot
connectDiscord()
  .then(() => {
    console.log("Discord Bot Started.");
  })
  .catch((err) => {
    console.log(err);
    console.log(`An error has occured while trying to start the discord bot.`);
  });

app.use(express.json());
app.use(decodeIDToken);
app.use(morgan("dev"));
app.use(cors(["*"]));

//Routers
app.use("/debug", debugRouter);
app.use("/user", userRouter);

app.get("/", (req, res, next) => {
  const auth = req.currentUser;
  res.send(
    "Backend express server is running fine. You can try debugging at /debug for more information."
  );
});

app.post("/", (req, res, next) => {
  res.send(
    `Server has detected you're trying to perform HTTP Post on the express.`
  );
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server is up and running on port : ${PORT}`);
});
