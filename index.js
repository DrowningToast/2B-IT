// Setup our environment variables via dotenv
require("dotenv").config();
// Import relevant classes from discord.js
const { Client, Intents } = require("discord.js");
const { default: mongoose } = require("mongoose");
const handleError = require("./middlewares/handleError");
const {
  preventRecrusive,
  onRecrusive,
} = require("./middlewares/preventrecrusive");
// Instantiate a new client with some necessary parameters.
const client = new Client({
  partials: ["MESSAGE", "REACTION"],
  intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES],
});
// Notify progress
client.on("ready", function (msg) {
  console.log(`Logged in as ${client.user.tag}!`);
});

// Authenticate
client.login(process.env.DISCORD_TOKEN);

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

client.on("messageCreate", async (msg) => {
  console.log(msg.content);
  try {
    await preventRecrusive(msg);
  } catch (e) {
    onRecrusive(e).catch(handleError(client));
  }
});
