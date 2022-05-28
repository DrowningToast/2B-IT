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

const connectDiscord = () => {
  return new Promise((resolve, reject) => {
    // Notify progress
    client.on("ready", function (msg) {
      console.log(`Logged in as ${client.user.tag}!`);
    });

    // Authenticate
    client.login(process.env.DISCORD_TOKEN);

    client.on("messageCreate", async (msg) => {
      try {
        await preventRecrusive(msg);
      } catch (e) {
        onRecrusive(e).catch(handleError(client));
      }
    });
  });
};

module.exports = {
  client,
  connectDiscord,
};
