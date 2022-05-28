const { Message, Client } = require("discord.js");
const channels = require("../../utils/channels");

/**
 * @param {Client} client
 * @param {Message} msg
 */
const verify = (client, msg) => {
  return new Promise((resolve, reject) => {
    if (msg.channelId === channels["moderator-only"]) {
      setTimeout(() => {
        resolve("Succesfully verified <3");
      }, 1500);
    } else {
      reject("Wrong channel id");
    }
  });
};

module.exports = verify;
