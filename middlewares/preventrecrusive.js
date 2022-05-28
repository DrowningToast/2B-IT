const { Message } = require("discord.js");
const { ANDROID } = require("../utils/roles");

/**
 * @param {Message} msg
 */
const preventRecrusive = (msg) => {
  return new Promise((resolve, reject) => {
    if (
      msg.member.roles.cache.some((role) => {
        return role.id === ANDROID;
      })
    ) {
      reject({
        type: "recrusion",
        msg: "the sender is the bot",
      });
    } else {
      resolve("the sender is not the bot");
    }
  });
};

const onRecrusive = (error) => {
  return new Promise((resolve, reject) => {
    if (error?.type === "recrusion") {
      resolve();
    } else {
      reject(error);
    }
  });
};

module.exports = {
  preventRecrusive,
  onRecrusive,
};
