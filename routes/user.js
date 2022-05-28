const express = require("express");
const validateRole = require("../middlewares/validateRole");
const User = require("../schema/User");
const UserSchema = require("../schema/User");
const generateToken = require("../utils/generateToken");

const userRouter = express.Router();

/**
 * @description Generate a new token, overwrite an old one if it's available
 * @description PERM : USER, ADMIN
 */
userRouter.get("/token/new", async (req, res) => {
  try {
    if (!req.currentUser) return res.status(401).send("Unauthorized");

    newToken = generateToken(16);
    const response = await User.findOneAndUpdate(
      {
        email: req.currentUser.email,
      },
      {
        linkToken: newToken,
        discordUserId: "",
      }
    );
    res.send(newToken);
  } catch (e) {
    console.log(e);
    res.status(e.code ?? 500).send(e.message ?? "Unexpected error has occured");
  }
});

/**
 * @description Retrive a link token, if not exist generate a new one
 * @description PERM : USER, ADMIN
 */
userRouter.get("/token", async (req, res) => {
  try {
    if (!req.currentUser) return res.status(401).send("Unauthorized");
    const token = await User.findOne({
      email: req.currentUser.email,
    }).select("linkToken");

    let newToken = token ?? null;
    if (token) {
      newToken = generateToken(16);
      const response = await User.findOneAndUpdate(
        {
          email: req.currentUser.email,
        },
        {
          linkToken: newToken,
          discordUserId: "",
        }
      );
    }
    res.send(newToken);
  } catch (e) {
    console.log(e);
    res.status(e.code ?? 500).send(e.message ?? "Unexpected error has occured");
  }
});

/**
 * @description Get specific user data
 * @description PERM : USER, ADMIN
 */
userRouter.get("/:email", async (req, res) => {
  try {
    if (req.currentUser.email === req.params.email) {
      const user = await User.findOne({
        email: req.params.email,
      });
      console.log(user);
      res.send(user);
    } else {
      res.status = 401;
      res.end("Insufficient permission");
    }
  } catch (e) {
    console.log(e);
    res.status(e.code ?? 500).send(e.message ?? "Unexpected error has occured");
  }
});

/**
 * @description Get all user data
 * @description PERM : ADMIN
 */
userRouter.get("/", async (req, res) => {
  try {
    if (await validateRole(req?.currentUser, ["ADMIN"])) {
      const users = await User.find();
      res.send(users);
    } else {
      res.status = 401;
      res.end("Insufficient permission");
    }
  } catch (e) {
    console.log(e);
    res.status(e.code ?? 500).send(e.message ?? "Unexpected error has occured");
  }
});

/**
 * @description First time creating user data
 */
userRouter.post("/", async (req, res) => {
  try {
    if (!req.currentUser)
      return res.status(401).send("Insufficient permission");
    const user = await User.findOne({ email: req?.currentUser.email });
    if (user) return res.status(400).send("This user already exist");
    const newUser = new User({
      email: req.currentUser.email,
      uid: req.currentUser.uid,
    });
    const response = await newUser.save();
    res.json(response);
  } catch (e) {
    console.log(e);
    res.status(e.code ?? 500).send(e.message ?? "Unexpected error has occured");
  }
});

/**
 * @description Update user information after logged in
 * @param {String} body.firstName
 * @param {String} body.lastName
 * @param {Date} body.birth
 * @param {String} body.school
 */
userRouter.patch("/", async (req, res) => {
  try {
    const user = await User.find({
      email: req.currentUser.email,
    });
    const data = req.body;
    delete data.linkToken;
    delete data.role;
    delete data.email;
    delete data.discordUserId;
    if (!user) return res.status(400).send("The user doesn't exist in the DB");
    const response = await User.updateOne(
      {
        email: req.currentUser.email,
      },
      {
        ...req.body,
      }
    );
    res.json(response);
  } catch (e) {
    console.log(e);
    res.status(e.code ?? 500).send(e.message ?? "Unexpected error has occured");
  }
});

module.exports = userRouter;
