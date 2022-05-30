// const { CommandInteraction } = require("discord.js/typings/index");
const { Message, Client } = require("discord.js");
const User = require("../../schema/User");
const channels = require("../../utils/channels");

/**
 * @param {Client} client
 * @param {CommandInteraction} interaction
 */
const verify = (client, interaction) => {
  return new Promise(async (resolve, reject) => {
    const user = await User.findOne({
      $and: [
        {
          linkToken: interaction.options.getString("token"),
        },
        {
          discordUserId: null,
        },
      ],
    });
    if (user) {
      await User.findOneAndUpdate(
        {
          linkToken: interaction.options.getString("token"),
          discordUserId: null,
        },
        {
          discordUserId: interaction.member.id,
        }
      );
      resolve(user);
    } else {
      reject("User not found");
    }
  });
};

module.exports = verify;
