// Setup our environment variables via dotenv
require("dotenv").config();
// Import relevant classes from discord.js
const { Client, Intents } = require("discord.js");
const handleError = require("./middlewares/handleError");
const {
  preventRecrusive,
  onRecrusive,
} = require("./middlewares/preventrecrusive");
const verify = require("./routes/verification");
const { RECRUIT, ANDROID } = require("./utils/roles");
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

client.on("messageCreate", async (msg) => {
  console.log(msg.content);
  try {
    if (msg.content === "echo") {
      msg.channel.send("echo back!");
    }
    if (msg.content === "error") {
      throw null;
    }
    await preventRecrusive(msg);
  } catch (e) {
    onRecrusive(e).catch(handleError(client));
  }
});
