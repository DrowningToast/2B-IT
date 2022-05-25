const { Message, Client } = require("discord.js");
const channels = require("../utils/channels");

/**
 * @param {Client} client
 * @param {Message} msg
 */
const handleError = (client) => {
  return (msg) => {
    const _channel = client.channels.cache.get(channels["moderator-only"]);
    _channel.send(
      "Unknown errors. My preceptors are failing. . . Please contact admin and moderators for more information."
    );
  };
};

module.exports = handleError;
