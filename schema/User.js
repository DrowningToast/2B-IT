const mongoose = require("mongoose");

const UserSchema = mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  discordUserId: {
    type: String,
  },
  uid: {
    type: String,
    required: true,
  },
  linkToken: {
    type: String,
  },
  birth: {
    type: Date,
  },
  school: {
    type: String,
  },
  firstName: String,
  lastName: String,
  role: {
    type: String,
    enum: ["DEFAULT", "ADMIN"],
    default: "DEFAULT",
  },
  thoughts: {
    fate: String,
    reasons: String,
    problems: String,
  },
});

module.exports = mongoose.model("Users", UserSchema);
