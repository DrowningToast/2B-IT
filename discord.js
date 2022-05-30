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
const { ONLINE_CAMPER } = require("./utils/roles");
const channels = require("./utils/channels");
const wait = require("node:timers/promises").setTimeout;

// Instantiate a new client with some necessary parameters.
const client = new Client({
  partials: ["MESSAGE", "REACTION"],
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.GUILD_MEMBERS,
  ],
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
        .setDescription(
          "Shorthand function for promoting user to ONLINE CAMPER."
        )
        .addUserOption((option) => {
          return option
            .setName("target")
            .setDescription("The target user being promoted.")
            .setRequired(true);
        }),
      new SlashCommandBuilder()
        .setName("stats")
        .setDescription("Check ToBeIT members stats"),
      new SlashCommandBuilder()
        .setName("recent")
        .setDescription(
          "See the amount of user recently joined the server in the past period of time."
        )
        .addIntegerOption((option) => {
          return option
            .setName("hours")
            .setDescription("The amount of hours you want me to look into.")
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
          const user = interaction.options.getUser("target");
          const guild = client.guilds.cache.get(process.env.tobeit_id);
          const member = guild.members.cache.get(user.id);
          member.roles.add(
            guild.roles.cache.find((role) => role.id === ONLINE_CAMPER)
          );
          const botLog = guild.channels.cache.get(channels["bot-log"]);
          botLog.send(
            `User ${interaction.member.nickname} has promoted ${member.nickname} to ONLINE CAMPER`
          );
          interaction.reply({
            content: "Done. The user has been promoted.",
            ephemeral: true,
          });
        } catch (e) {
          interaction.reply({
            content: "An error has occured, please check log",
            ephemeral: true,
          });
        }
      } else if (commandName === "stats") {
        interaction.deferReply({ ephemeral: true });
        // const server = client.guilds.fetch()
        const server = client.guilds.cache.get(process.env.tobeit_id);
        const members = await server.members.fetch();
        // console.log(members.size);

        let empty_count = 0;
        let enrolled_count = 0;

        members.forEach((member) => {
          // Check verify percentage
          if (member.roles.cache.size === 1) {
            empty_count++;
          } else if (
            member.roles.cache.some((role) => role.id === ONLINE_CAMPER)
          ) {
            enrolled_count++;
          }
        });

        const total = empty_count + enrolled_count;
        await wait(2000);
        interaction.editReply({
          content: `Total User : ${total}\nVerified : ${enrolled_count}\nPercentage : ${
            (enrolled_count / total) * 100
          }%
          `,
          ephemeral: true,
        });
      } else if (commandName === "recent") {
        try {
          interaction.deferReply({
            ephemeral: true,
          });
          let _members = [];
          const server = client.guilds.cache.get(process.env.tobeit_id);
          const members = await server.members.fetch();
          members.forEach((member) => {
            _members.push(member.joinedTimestamp);
          });

          const current = new Date().getTime();

          _members = _members.filter((member) => {
            return (
              current - member <
              interaction.options.getInteger("hours") * 3600 * 1000
            );
          });

          await wait(2000);

          interaction.editReply({
            content: `${
              _members.length
            } users have joined in the last ${interaction.options.getInteger(
              "hours"
            )} hours`,
            ephemeral: true,
          });
        } catch (e) {
          console.log(e);
          interaction.editReply({
            content: "An error has occured, check logs",
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
