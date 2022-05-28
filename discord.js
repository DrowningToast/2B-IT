// Setup our environment variables via dotenv
require("dotenv").config();
// Import relevant classes from discord.js
const { Client, Intents } = require("discord.js");
const { SlashCommandBuilder } = require("@discordjs/builders");
const { REST } = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v9");
const handleError = require("./middlewares/handleError");
const {
  preventRecrusive,
  onRecrusive,
} = require("./middlewares/preventrecrusive");
const verify = require("./routes/discord/verification");

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

    // Setup commands
    const commands = [
      new SlashCommandBuilder()
        .setName("verify")
        .setDescription("Link your Discord with a Google account")
        .addStringOption((option) => {
          return option
            .setName("token")
            .setDescription("Your account link token from the ToBeIT website")
            .setRequired(true);
        }),
    ].map((command) => command.toJSON());

    const rest = new REST({ version: "9" }).setToken(process.env.DISCORD_TOKEN);

    rest
      .put(
        Routes.applicationGuildCommands(
          process.env.APP_ID,
          process.env.GUILD_ID
        ),
        { body: commands }
      )
      .then(() => console.log("Successfully registered application commands."))
      .catch(console.error);

    // Listen to command
    client.on("interactionCreate", async (interaction) => {
      if (!interaction.isCommand()) return;

      const { commandName } = interaction;

      if (commandName === "verify") {
        // Verify the user
        try {
          const user = await verify(client, interaction);
          await interaction.reply({
            content: `Sucessfully linked ${user.email} with this Discord account`,
            ephemeral: true,
          });
        } catch (e) {
          interaction.reply({
            content: "Link failed. Double check your token",
            ephemeral: true,
          });
        }
      }
    });

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
